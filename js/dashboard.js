import {auth,db} from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs, //r
  query, //req
  orderBy,
  serverTimestamp, //server's current time
  deleteDoc,
  doc,
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/*GLOBAL STATE*/

let currentRole = null;
let stockChart = null; //in short,chart set == 0(in all terms) iniitally 

/*NAVigation ELEMENTS ref.*/

const navInventory =document.getElementById("navInventory");
const navAnalytics =document.getElementById("navAnalytics");
const navSuppliers =document.getElementById("navSuppliers");
const navReliability =document.getElementById("navReliability");
const navLogs =document.getElementById("navLogs");

/*SECTIONS*/

const inventorySection= document.getElementById("inventorySection");
const analyticsSection =document.getElementById("analyticsSection");
const supplierSection= document.getElementById("supplierSection");
const reliabilitySection=document.getElementById("reliabilitySection");
const logsSection=document.getElementById("logsSection");

/*INVENTORY FORM*/

const itemNameInput = document.getElementById("itemName");
const categoryInput =document.getElementById("category");
const quantityInput =document.getElementById("quantity");
const warehouseInput =document.getElementById("warehouse");
const supplierInput= document.getElementById("supplier");
const typeSelect =document.getElementById("type");
const addItemBtn =document.getElementById("addItemBtn");

/*TABLE ELEMENTS*/

const inventoryList =document.getElementById("inventoryList");
const logsList =document.getElementById("logsList");
const supplierScores =document.getElementById("supplierScores");
const warehouseFilter =document.getElementById("warehouseFilter");

/*RELIABILITY FORM + REVIEW HISTORY*/

const reviewSupplier =document.getElementById("reviewSupplier");
const productQuality = document.getElementById("productQuality");
const serviceQuality =document.getElementById("serviceQuality");
const feedbackQuality =document.getElementById("feedbackQuality");
const reviewRemarks= document.getElementById("reviewRemarks");
const submitReviewBtn =document.getElementById("submitReviewBtn");
const reviewHistory =document.getElementById("reviewHistory");

/*AUTH + ROLE*/

onAuthStateChanged(auth, async(user) => {
  if(!user) {
    window.location.href = "index.html";
    return;
  }

  const snap =await getDoc(doc(db, "users", user.uid));
  currentRole =snap.data().role; //extracts-->reads role-->stores in currentrole

  applyRolePermissions();
  reloadAll();
  loadSuppliersForReview();
  loadReviewHistory();
});

/*LOGOUT*/

window.logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

/*ROLE PERMS*/

function applyRolePermissions() {
  if (currentRole === "supplier") {
    navAnalytics.style.display = "none";
    navSuppliers.style.display = "none";
    navReliability.style.display = "none";

    addItemBtn.disabled = true;
    itemNameInput.disabled = true;
    categoryInput.disabled = true;
    quantityInput.disabled = true;
    warehouseInput.disabled = true;
    supplierInput.disabled = true;
    typeSelect.disabled = true;
  }

  if(currentRole === "staff") {
    navSuppliers.style.display = "none";
  }
}

/*NAVIGATION*/

navInventory.onclick = () => show("inventory");
navAnalytics.onclick = () => show("analytics");
navSuppliers.onclick = () => show("suppliers");
navReliability.onclick = () => show("reliability");
navLogs.onclick = () => show("logs");
//page sec visibility (tab swithing in short)
function show(section) { //shows particular section and hides the rest (block-->css display val)
  inventorySection.style.display = section === "inventory" ? "block" : "none";
  analyticsSection.style.display = section === "analytics" ? "block" : "none";
  supplierSection.style.display = section === "suppliers" ? "block" : "none";
  reliabilitySection.style.display = section === "reliability" ? "block" : "none";
  logsSection.style.display = section === "logs" ? "block" : "none";
}


/* ADD/UPDATE STOCK */
addItemBtn.onclick = async () => {
  if(currentRole === "supplier") return;

  const name = itemNameInput.value.trim();
  const category = categoryInput.value.trim();
  const qty = Number(quantityInput.value);
  const warehouse = warehouseInput.value.trim();
  const supplier = supplierInput.value.trim();
  const type = typeSelect.value;

  if(!name || !category || qty <= 0 || !warehouse) {
    alert("Fill all required fields correctly");
    return;
  }
  if(type === "IN" && !supplier) {
    alert("Supplier required for Stock IN");
    return;
  }

  await addDoc(collection(db,"inventory"),{
    name,
    category,
    warehouse,
    quantity: type === "IN" ? qty : -qty,
    createdAt: serverTimestamp()
  });
  await addDoc(collection(db,"logs"), {
    name,
    warehouse,
    supplier: supplier || "N/A",
    type,
    qty,
    createdAt: serverTimestamp()
  });
  reloadAll();
};

/*REMOVE STOCK(ADMIN + STAFF)*/


window.removeStock = async(name, warehouse, currentQty) => {
  if (currentRole === "supplier") return;

  let qty = Number(prompt(`Remove quantity (Available: ${currentQty})`)); //pop-up with current qty
  if (!qty || qty <= 0) return;

  if (qty > currentQty) {
    const ok = confirm(
      `Only ${currentQty} exists.\nThis will remove all available stock. Continue?`
    );
    if (!ok) return;
    qty = currentQty;
  }

  await addDoc(collection(db, "inventory"), {
    name,
    warehouse,
    quantity: -qty,
    createdAt:serverTimestamp()
  });

  await addDoc(collection(db, "logs"), {
    name,
    warehouse,
    supplier: "Manual Removal",
    type: "OUT",
    qty,
    createdAt:serverTimestamp()
  });

  reloadAll();
};

/* DELETE LOG(ADMIN ONLY) */

window.deleteLog = async (logId) => {
  if(currentRole !== "admin") return;
  if(!confirm("Delete this log permanently?")) return;

  await deleteDoc(doc(db,"logs",logId));
  reloadAll();
};


/* MASTER RELOAD */


function reloadAll() {
  loadInventory();
  loadLogs();
  if (currentRole !== "supplier") {
    loadSupplierScores();
    loadItemAnalytics();
  }
}

/* FILTER */

warehouseFilter.oninput = loadInventory;

async function loadInventory(){
  inventoryList.innerHTML = "";

  const filter = warehouseFilter.value.trim().toLowerCase();

  const snap = await getDocs(collection(db, "inventory"));
  const map = {};

  snap.forEach(d => {
    const i = d.data();
    const key = i.name + "::" + i.warehouse; //groups stock with warhouse name
    if (!map[key]) map[key] = { ...i }; //...--->copies all fields from i into a new object 
    else map[key].quantity += i.quantity;
  });

  Object.values(map).forEach(i =>{
    if (i.quantity <= 0) return;

    if (filter && !i.warehouse.toLowerCase().includes(filter)) return; 

    inventoryList.innerHTML += `
      <tr>
        <td>${i.name}</td>
        <td>${i.category}</td>
        <td>${i.warehouse}</td>
        <td>${i.quantity}</td>
        <td>${i.quantity < 5 ? "⚠ Low" : "OK"}</td>  
        <td>
          ${
            currentRole !== "supplier"
              ? `<button onclick="removeStock('${i.name}','${i.warehouse}',${i.quantity})">Remove</button>`
              : "-"
          }
        </td>
      </tr>
    `;
  });
}

/* LOGS VIEW */


async function loadLogs() {
  logsList.innerHTML = "";   //resets UI and prevents duplicate 
  const q = query(collection(db, "logs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  // tr -> table row and td-> table cell/data
  snap.forEach(d => {       //snap is firestone loop helper 
    const l = d.data();       
    logsList.innerHTML += `
      <tr>                                           
        <td>${l.name}</td>
        <td>${l.warehouse}</td>
        <td>${l.supplier}</td>
        <td>${l.type}</td>
        <td>${l.qty}</td>
        <td>
          ${
            currentRole === "admin"
              ? `<button onclick="deleteLog('${d.id}')">Delete</button>`
              : "-"
          }
        </td>
      </tr>
    `;
  });
}

/*SUPPLIER PERFORMANCE*/


async function loadSupplierScores(){
  supplierScores.innerHTML = "";   
  const snap =await getDocs(collection(db, "logs"));
  const stats ={};

  snap.forEach(d => {
    const l = d.data();
    if (!l.supplier || l.supplier === "N/A") return;
    if (!stats[l.supplier]) stats[l.supplier] = { in: 0, out: 0 };
    if (l.type === "IN") stats[l.supplier].in += l.qty;
    else stats[l.supplier].out += l.qty;
  });

  //*10->in     -*5->out 
  Object.entries(stats).forEach(([s, v]) => {
    supplierScores.innerHTML += `
      <tr>
        <td>${s}</td>
        <td>${v.in}</td>
        <td>${v.out}</td>
        <td>${Math.max(0, v.in * 10 - v.out * 5)}</td> 
      </tr>
    `;
  });
}

/*ANALYTICS*/


async function loadItemAnalytics() {
  const snap = await getDocs(collection(db, "logs"));
  const map = {};

  snap.forEach(d => {
    const l = d.data();
    if (!map[l.name]) map[l.name] = { in: 0, out: 0 };
    if (l.type === "IN") map[l.name].in += l.qty;
    else map[l.name].out += l.qty;
  });
    
  const labels = Object.keys(map); //more like pointer or returns all the keys in map
  const inData = labels.map(i => map[i].in);
  const outData = labels.map(i => map[i].out);

  const ctx = document.getElementById("stockChart");
  if(stockChart) stockChart.destroy();

  stockChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Stock IN", data: inData },
        { label: "Stock OUT", data: outData }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio: false
    }
  });
}

/* RELIABILITY LOGIC */


async function loadSuppliersForReview() {
  reviewSupplier.innerHTML= "";
  const snap =await getDocs(collection(db, "logs"));
  const set =new Set();

  // drop down list (next 2)
  snap.forEach(d => {
    const s = d.data().supplier;
    if(s && s !== "N/A" && s !== "Manual Removal") set.add(s);
  });

  set.forEach(s => {
    const opt =document.createElement("option");
    opt.value=s; //value sent
    opt.textContent =s;  //seen by the user 
    reviewSupplier.appendChild(opt);
  });
}

submitReviewBtn.onclick =async () => {
  if(!reviewSupplier.value) {
    alert("Select supplier");
    return;
  }

  await addDoc(collection(db, "supplier_reviews"), {
    supplier:reviewSupplier.value,
    productQuality:Number(productQuality.value),
    serviceQuality:Number(serviceQuality.value),
    feedbackQuality:Number(feedbackQuality.value),
    remarks: reviewRemarks.value || "",
    reviewedBy: currentRole,
    createdAt: serverTimestamp()
  });

  productQuality.value= "";
  serviceQuality.value= "";
  feedbackQuality.value= "";
  reviewRemarks.value= "";
  loadReviewHistory();
};

/*REVIEW HISTORY under reliability(ONLY ADMIN CAN DELETE) */

async function loadReviewHistory() {
  reviewHistory.innerHTML = "";
  const q = query(collection(db, "supplier_reviews"),orderBy("createdAt", "desc"));
  const snap =await getDocs(q);

  snap.forEach(d => {
    const r =d.data();
    reviewHistory.innerHTML += `
      <tr>
        <td>${r.supplier}</td>
        <td>${r.productQuality}</td>
        <td>${r.serviceQuality}</td>
        <td>${r.feedbackQuality}</td>
        <td>${r.remarks || "-"}</td>
        <td>${r.reviewedBy}</td>
        <td>${r.createdAt?.toDate().toLocaleDateString()}</td>
        <td>
          ${
            currentRole === "admin"
              ? `<button onclick="deleteReview('${d.id}')">Delete</button>`
              : "-"
          }
        </td>
      </tr>
    `;
  });
}

window.deleteReview =async(reviewId) => {
  if (currentRole !== "admin") return;
  if (!confirm("Delete this review permanently?")) return;

  await deleteDoc(doc(db,"supplier_reviews",reviewId));
  loadReviewHistory();
};
