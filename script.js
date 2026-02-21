/* ===== FleetFlow – Enterprise + Roles ===== */

// ==================== Inline SVG Logo ====================
var LOGO_SVG = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">'
  + '<rect width="32" height="32" rx="8" fill="#3b82f6"/>'
  + '<path d="M7 22V12l4-4h10l4 4v10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<circle cx="11" cy="22" r="2.5" fill="#fff"/>'
  + '<circle cx="21" cy="22" r="2.5" fill="#fff"/>'
  + '<line x1="13.5" y1="22" x2="18.5" y2="22" stroke="#fff" stroke-width="2"/>'
  + '<rect x="12" y="11" width="8" height="5" rx="1" fill="rgba(255,255,255,.3)"/>'
  + '</svg>';

// ==================== Helpers ====================
function getData(k){return JSON.parse(localStorage.getItem(k))||[];}
function setData(k,d){localStorage.setItem(k,JSON.stringify(d));}
function todayDate(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}

// ==================== Session ====================
function getSession(){
  try{return JSON.parse(localStorage.getItem("ff_session"))||null;}catch(e){return null;}
}
function setSession(s){localStorage.setItem("ff_session",JSON.stringify(s));}
function clearSession(){localStorage.removeItem("ff_session");}

function requireLogin(){
  var s=getSession();
  if(!s||!s.role){window.location.href="login.html";return null;}
  return s;
}

function getRole(){var s=getSession();return s?s.role:null;}
function getUserName(){var s=getSession();return s?s.name:"";}

// Role helpers
function canManageVehicles(){return getRole()==="manager";}
function canManageDrivers(){return getRole()==="manager";}
function canManageTrips(){var r=getRole();return r==="manager"||r==="dispatcher";}
function isAnalyst(){return getRole()==="analyst";}

function doLogin(){
  var name=document.getElementById("loginName").value.trim();
  var role=document.getElementById("loginRole").value;
  if(!name){showNotification("Please enter your name.","error");return;}
  if(!role){showNotification("Please select a role.","error");return;}
  setSession({name:name,role:role});
  window.location.href="index.html";
}

function doLogout(){
  clearSession();
  window.location.href="login.html";
}

// ==================== Loader ====================
function hideLoader(){
  var el=document.getElementById("app-loader");
  if(el) setTimeout(function(){el.classList.add("hidden");},300);
}

// ==================== Notifications ====================
function ensureNotifContainer(){
  if(!document.getElementById("notification-container")){
    var c=document.createElement("div");c.id="notification-container";document.body.appendChild(c);
  }
}
function showNotification(msg,type){
  ensureNotifContainer();
  var c=document.getElementById("notification-container");
  var icons={success:"\u2705",error:"\u274C",info:"\u2139\uFE0F"};
  var t=document.createElement("div");t.className="toast "+(type||"info");
  t.innerHTML="<span>"+(icons[type]||"")+"</span><span>"+msg+"</span>";
  c.appendChild(t);
  setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},2900);
}

// ==================== Confirm Modals ====================
function showConfirm(msg,onYes){
  var o=document.createElement("div");o.className="modal-overlay";
  o.innerHTML='<div class="modal-box"><div class="modal-icon">\u26A0\uFE0F</div><h3>Are you sure?</h3><p>'+msg+'</p><div class="modal-actions"><button class="btn-cancel" id="mcC">Cancel</button><button class="btn-confirm-delete" id="mcY">Delete</button></div></div>';
  document.body.appendChild(o);
  document.getElementById("mcC").onclick=function(){document.body.removeChild(o);};
  document.getElementById("mcY").onclick=function(){document.body.removeChild(o);onYes();};
  o.addEventListener("click",function(e){if(e.target===o)document.body.removeChild(o);});
}

function showActionConfirm(msg,btnText,onYes){
  var o=document.createElement("div");o.className="modal-overlay";
  o.innerHTML='<div class="modal-box"><div class="modal-icon">\u2753</div><h3>Confirm Action</h3><p>'+msg+'</p><div class="modal-actions"><button class="btn-cancel" id="acC">Cancel</button><button class="btn-confirm-action" id="acY">'+btnText+'</button></div></div>';
  document.body.appendChild(o);
  document.getElementById("acC").onclick=function(){document.body.removeChild(o);};
  document.getElementById("acY").onclick=function(){document.body.removeChild(o);onYes();};
  o.addEventListener("click",function(e){if(e.target===o)document.body.removeChild(o);});
}

// ==================== Vehicle Detail Modal ====================
function showVehicleDetail(idx){
  var vehicles=getData("vehicles"),v=vehicles[idx];if(!v)return;
  var trips=getData("trips"),tc=0;
  for(var i=0;i<trips.length;i++){if(trips[i].vehicle===v.name)tc++;}
  var bc=v.status==="On Trip"?"badge-ontrip":"badge-available";
  var o=document.createElement("div");o.className="modal-overlay detail-modal";
  o.innerHTML='<div class="modal-box"><h3>\uD83D\uDE9B Vehicle Details</h3><div class="detail-grid">'
    +'<div class="detail-item"><span class="detail-label">Vehicle Name</span><span class="detail-val">'+v.name+'</span></div>'
    +'<div class="detail-item"><span class="detail-label">License Plate</span><span class="detail-val">'+v.plate+'</span></div>'
    +'<div class="detail-item"><span class="detail-label">Capacity</span><span class="detail-val">'+v.capacity+' kg</span></div>'
    +'<div class="detail-item"><span class="detail-label">Status</span><span class="detail-val"><span class="badge '+bc+'">'+(v.status||"Available")+'</span></span></div>'
    +'<div class="detail-item full"><span class="detail-label">Trips Assigned</span><span class="detail-val">'+tc+' trip'+(tc!==1?'s':'')+'</span></div>'
    +'</div><button class="detail-close" id="dC">Close</button></div>';
  document.body.appendChild(o);
  document.getElementById("dC").onclick=function(){document.body.removeChild(o);};
  o.addEventListener("click",function(e){if(e.target===o)document.body.removeChild(o);});
}

// ==================== Vehicle Status ====================
function updateVehicleStatus(name,status){
  var v=getData("vehicles");
  for(var i=0;i<v.length;i++){if(v[i].name===name){v[i].status=status;break;}}
  setData("vehicles",v);
}
function recalcAllVehicleStatuses(){
  var vehicles=getData("vehicles"),trips=getData("trips"),map={};
  for(var i=0;i<trips.length;i++){if(trips[i].status!=="Completed")map[trips[i].vehicle]=true;}
  for(var j=0;j<vehicles.length;j++){vehicles[j].status=map[vehicles[j].name]?"On Trip":"Available";}
  setData("vehicles",vehicles);
}

// ==================== Vehicles CRUD ====================
function addVehicle(){
  if(!canManageVehicles()){showNotification("Access denied.","error");return;}
  var nE=document.getElementById("vehicleName"),pE=document.getElementById("licensePlate"),cE=document.getElementById("capacity");
  var name=nE.value.trim(),plate=pE.value.trim(),cap=cE.value.trim();
  if(!name||!plate||!cap){showNotification("Please fill in all vehicle fields.","error");return;}
  var v=getData("vehicles");
  v.push({name:name,plate:plate,capacity:Number(cap),status:"Available"});
  setData("vehicles",v);nE.value="";pE.value="";cE.value="";
  renderVehicles();updateDashboard();showNotification("Vehicle added successfully!","success");
}
function deleteVehicle(idx){
  if(!canManageVehicles()){showNotification("Access denied.","error");return;}
  var v=getData("vehicles"),veh=v[idx];
  showConfirm("Delete vehicle <b>"+veh.name+"</b> and its trips?",function(){
    var trips=getData("trips");trips=trips.filter(function(t){return t.vehicle!==veh.name;});setData("trips",trips);
    v.splice(idx,1);setData("vehicles",v);
    recalcAllVehicleStatuses();renderVehicles();renderTrips();updateDashboard();
    showNotification("Vehicle deleted!","success");
  });
}
function renderVehicles(){
  var vehicles=getData("vehicles"),tbody=document.getElementById("vehicleTableBody");if(!tbody)return;
  var q=(document.getElementById("vehicleSearch")||{}).value;q=q?q.toLowerCase():"";
  var filtered=vehicles.filter(function(v){if(!q)return true;return v.name.toLowerCase().indexOf(q)>-1||v.plate.toLowerCase().indexOf(q)>-1;});
  if(filtered.length===0){
    var msg=q?"No vehicles match your search.":"No vehicles available";
    tbody.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">\uD83D\uDE9A</div><div class="empty-text">'+msg+'</div><div class="empty-sub">'+(q?"Try a different search.":"Add your first vehicle above.")+'</div></div></td></tr>';return;
  }
  var showDel=canManageVehicles();
  tbody.innerHTML=filtered.map(function(v){
    var ri=vehicles.indexOf(v);var bc=v.status==="On Trip"?"badge-ontrip":"badge-available";
    var act=showDel?'<button class="btn btn-danger" onclick="event.stopPropagation();deleteVehicle('+ri+')">Delete</button>':'\u2014';
    return '<tr class="clickable" onclick="showVehicleDetail('+ri+')"><td>'+v.name+'</td><td>'+v.plate+'</td><td>'+v.capacity+' kg</td><td><span class="badge '+bc+'">'+(v.status||"Available")+'</span></td><td class="table-actions">'+act+'</td></tr>';
  }).join("");
}

// ==================== Drivers CRUD ====================
function addDriver(){
  if(!canManageDrivers()){showNotification("Access denied.","error");return;}
  var nE=document.getElementById("driverName"),lE=document.getElementById("licenseNumber");
  var name=nE.value.trim(),lic=lE.value.trim();
  if(!name||!lic){showNotification("Please fill in all driver fields.","error");return;}
  var d=getData("drivers");d.push({name:name,license:lic});setData("drivers",d);
  nE.value="";lE.value="";
  renderDrivers();updateDashboard();showNotification("Driver added successfully!","success");
}
function deleteDriver(idx){
  if(!canManageDrivers()){showNotification("Access denied.","error");return;}
  var d=getData("drivers"),dr=d[idx];
  showConfirm("Delete driver <b>"+dr.name+"</b> and associated trips?",function(){
    var trips=getData("trips");trips=trips.filter(function(t){return t.driver!==dr.name;});setData("trips",trips);
    d.splice(idx,1);setData("drivers",d);
    recalcAllVehicleStatuses();renderDrivers();renderTrips();renderVehicles();updateDashboard();
    showNotification("Driver deleted!","success");
  });
}
function renderDrivers(){
  var drivers=getData("drivers"),tbody=document.getElementById("driverTableBody");if(!tbody)return;
  var q=(document.getElementById("driverSearch")||{}).value;q=q?q.toLowerCase():"";
  var filtered=drivers.filter(function(d){if(!q)return true;return d.name.toLowerCase().indexOf(q)>-1;});
  if(filtered.length===0){
    var msg=q?"No drivers match your search.":"No drivers available";
    tbody.innerHTML='<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">\uD83D\uDC64</div><div class="empty-text">'+msg+'</div><div class="empty-sub">'+(q?"Try a different search.":"Add your first driver above.")+'</div></div></td></tr>';return;
  }
  var showDel=canManageDrivers();
  tbody.innerHTML=filtered.map(function(d){
    var ri=drivers.indexOf(d);
    var act=showDel?'<button class="btn btn-danger" onclick="deleteDriver('+ri+')">Delete</button>':'\u2014';
    return '<tr><td>'+d.name+'</td><td>'+d.license+'</td><td class="table-actions">'+act+'</td></tr>';
  }).join("");
}

// ==================== Trips ====================
function loadVehicleDropdown(){
  var s=document.getElementById("tripVehicle");if(!s)return;
  var v=getData("vehicles");s.innerHTML='<option value="">-- Select Vehicle --</option>';
  v.forEach(function(vh,i){
    var lbl=vh.name+" ("+vh.plate+") \u2014 "+vh.capacity+" kg";
    if(vh.status==="On Trip")lbl+=" [On Trip]";
    s.innerHTML+='<option value="'+i+'">'+lbl+'</option>';
  });
}
function loadDriverDropdown(){
  var s=document.getElementById("tripDriver");if(!s)return;
  var d=getData("drivers");s.innerHTML='<option value="">-- Select Driver --</option>';
  d.forEach(function(dr,i){s.innerHTML+='<option value="'+i+'">'+dr.name+" ("+dr.license+")"+'</option>';});
}
function clearCargoError(){
  var inp=document.getElementById("cargoWeight"),err=document.getElementById("cargoError");
  if(inp)inp.classList.remove("input-error");if(err)err.classList.remove("visible");
}
function doCreateTrip(){
  var vI=document.getElementById("tripVehicle").value,dI=document.getElementById("tripDriver").value,cE=document.getElementById("cargoWeight");
  var vehicles=getData("vehicles"),drivers=getData("drivers");
  var vehicle=vehicles[Number(vI)],driver=drivers[Number(dI)],cargo=Number(cE.value.trim());
  var trips=getData("trips");
  trips.push({vehicle:vehicle.name,driver:driver.name,cargo:cargo,date:todayDate(),status:"Active"});
  setData("trips",trips);updateVehicleStatus(vehicle.name,"On Trip");
  document.getElementById("tripVehicle").value="";document.getElementById("tripDriver").value="";cE.value="";
  renderTrips();loadVehicleDropdown();renderVehicles();updateDashboard();
  showNotification("Trip created successfully!","success");
}
function addTrip(){
  if(!canManageTrips()){showNotification("Access denied.","error");return;}
  clearCargoError();
  var vI=document.getElementById("tripVehicle").value,dI=document.getElementById("tripDriver").value,cE=document.getElementById("cargoWeight"),cargo=cE.value.trim();
  if(vI===""||dI===""||!cargo){showNotification("Please fill in all trip fields.","error");return;}
  var vehicles=getData("vehicles"),vehicle=vehicles[Number(vI)],cargoNum=Number(cargo);
  if(cargoNum>vehicle.capacity){cE.classList.add("input-error");var err=document.getElementById("cargoError");if(err)err.classList.add("visible");return;}
  if(vehicle.status==="On Trip"){showActionConfirm("Vehicle <b>"+vehicle.name+"</b> is already on a trip. Create anyway?","Yes, Create Trip",doCreateTrip);return;}
  doCreateTrip();
}
function completeTrip(idx){
  if(!canManageTrips()){showNotification("Access denied.","error");return;}
  var trips=getData("trips"),t=trips[idx];if(!t||t.status==="Completed")return;
  t.status="Completed";setData("trips",trips);
  var hasActive=false;for(var i=0;i<trips.length;i++){if(trips[i].vehicle===t.vehicle&&trips[i].status==="Active"){hasActive=true;break;}}
  if(!hasActive)updateVehicleStatus(t.vehicle,"Available");
  renderTrips();renderVehicles();loadVehicleDropdown();updateDashboard();
  showNotification("Trip completed!","success");
}
function deleteTrip(idx){
  if(!canManageTrips()){showNotification("Access denied.","error");return;}
  var trips=getData("trips"),t=trips[idx];
  showConfirm("Delete trip for <b>"+t.vehicle+"</b>?",function(){
    var vN=t.vehicle,wasA=t.status==="Active";trips.splice(idx,1);setData("trips",trips);
    if(wasA){var still=false;for(var i=0;i<trips.length;i++){if(trips[i].vehicle===vN&&trips[i].status==="Active"){still=true;break;}}if(!still)updateVehicleStatus(vN,"Available");}
    renderTrips();renderVehicles();loadVehicleDropdown();updateDashboard();
    showNotification("Trip deleted!","success");
  });
}
function renderTrips(){
  var trips=getData("trips"),tbody=document.getElementById("tripTableBody");if(!tbody)return;
  var q=(document.getElementById("tripSearch")||{}).value;q=q?q.toLowerCase():"";
  var filtered=trips.filter(function(t){if(!q)return true;return t.vehicle.toLowerCase().indexOf(q)>-1||t.driver.toLowerCase().indexOf(q)>-1;});
  if(filtered.length===0){
    var msg=q?"No trips match your search.":"No trips created yet";
    tbody.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">\uD83D\uDCE6</div><div class="empty-text">'+msg+'</div><div class="empty-sub">'+(q?"Try a different search.":"Create your first trip above.")+'</div></div></td></tr>';return;
  }
  var canAct=canManageTrips();
  tbody.innerHTML=filtered.map(function(t){
    var ri=trips.indexOf(t);var bc=t.status==="Completed"?"badge-completed":"badge-active";
    var acts="";
    if(canAct){
      if(t.status==="Active") acts+='<button class="btn btn-success" onclick="completeTrip('+ri+')">\u2713 Complete</button>';
      acts+='<button class="btn btn-danger" onclick="deleteTrip('+ri+')">Delete</button>';
    } else { acts='\u2014'; }
    return '<tr><td>'+t.vehicle+'</td><td>'+t.driver+'</td><td>'+t.cargo+' kg</td><td>'+(t.date||"\u2014")+'</td><td><span class="badge '+bc+'">'+(t.status||"Active")+'</span></td><td class="table-actions">'+acts+'</td></tr>';
  }).join("");
}

// ==================== CSV Export ====================
function exportTripsCSV(){
  var trips=getData("trips");
  if(trips.length===0){showNotification("No trips to export.","info");return;}
  var rows=[["Vehicle","Driver","Cargo (kg)","Date","Status"]];
  trips.forEach(function(t){rows.push([t.vehicle,t.driver,t.cargo,t.date||"",t.status||"Active"]);});
  var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(",");}).join("\n");
  var blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  var url=URL.createObjectURL(blob);var a=document.createElement("a");
  a.href=url;a.download="fleetflow_trips_"+todayDate()+".csv";
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  showNotification("Trips exported as CSV!","success");
}

// ==================== Dashboard ====================
function updateDashboard(){
  var vehicles=getData("vehicles"),trips=getData("trips"),drivers=getData("drivers");
  var total=vehicles.length,onTrip=0;
  for(var i=0;i<vehicles.length;i++){if(vehicles[i].status==="On Trip")onTrip++;}
  var available=total-onTrip;
  var activeTrips=0;for(var j=0;j<trips.length;j++){if(trips[j].status==="Active")activeTrips++;}
  var utilization=total>0?Math.round((onTrip/total)*100):0;
  var busyDrivers={};for(var k=0;k<trips.length;k++){if(trips[k].status==="Active")busyDrivers[trips[k].driver]=true;}
  var availDrivers=0;for(var m=0;m<drivers.length;m++){if(!busyDrivers[drivers[m].name])availDrivers++;}

  var el;
  el=document.getElementById("totalVehicles");if(el)el.textContent=total;
  el=document.getElementById("availableVehicles");if(el)el.textContent=available;
  el=document.getElementById("onTripVehicles");if(el)el.textContent=onTrip;
  el=document.getElementById("totalDrivers");if(el)el.textContent=drivers.length;
  el=document.getElementById("availableDrivers");if(el)el.textContent=availDrivers;
  el=document.getElementById("totalTrips");if(el)el.textContent=trips.length;
  el=document.getElementById("activeTrips");if(el)el.textContent=activeTrips;
  el=document.getElementById("fleetUtilization");if(el)el.textContent=utilization+"%";
  var bar=document.getElementById("utilizationBar");if(bar)bar.style.width=utilization+"%";

  // Most used vehicle
  var mvEl=document.getElementById("mostUsedVehicle");
  if(mvEl){
    if(trips.length===0){mvEl.innerHTML='<span class="highlight-value">\u2014</span><div class="highlight-sub">No trips yet</div>';}
    else{
      var vc={};for(var n=0;n<trips.length;n++){vc[trips[n].vehicle]=(vc[trips[n].vehicle]||0)+1;}
      var best="",bestN=0;for(var vn in vc){if(vc[vn]>bestN){bestN=vc[vn];best=vn;}}
      mvEl.innerHTML='<span class="highlight-value">'+best+'</span><div class="highlight-sub">'+bestN+' trip'+(bestN!==1?'s':'')+'</div>';
    }
  }

  // Recent trips
  var rEl=document.getElementById("recentTrips");
  if(rEl){
    var last5=trips.slice(-5).reverse();
    if(last5.length===0){rEl.innerHTML='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC3</div><div class="empty-text">No recent activity</div></div>';}
    else{
      rEl.innerHTML='<ul class="recent-list">'+last5.map(function(t){
        var bc=t.status==="Completed"?"badge-completed":"badge-active";
        return '<li><span class="recent-route">'+t.vehicle+' \u2192 '+t.driver+'</span><span><span class="recent-date">'+(t.date||"")+'</span><span class="badge '+bc+' recent-badge">'+(t.status||"Active")+'</span></span></li>';
      }).join("")+'</ul>';
    }
  }
}

// ==================== Role Welcome Banner ====================
function renderRoleWelcome(){
  var el=document.getElementById("roleWelcome");if(!el)return;
  var s=getSession();if(!s)return;
  var roleMap={
    manager:{icon:"\uD83D\uDC51",title:"Fleet Manager",desc:"Full access — manage vehicles, drivers, and trips."},
    dispatcher:{icon:"\uD83D\uDCCB",title:"Dispatcher",desc:"Manage trips and view fleet data. Vehicle/driver management is read-only."},
    analyst:{icon:"\uD83D\uDCCA",title:"Analyst",desc:"View all fleet data and export reports. Read-only access."}
  };
  var r=roleMap[s.role]||roleMap.analyst;
  el.innerHTML='<div class="rw-icon">'+r.icon+'</div><div class="rw-text"><h2>Welcome, '+s.name+'</h2><p>'+r.title+' \u2014 '+r.desc+'</p></div>';
}

// ==================== Nav Setup ====================
function setupNav(){
  var s=getSession();if(!s)return;
  // Role badge
  var roleEl=document.getElementById("navRole");
  if(roleEl){
    var labels={manager:"Fleet Manager",dispatcher:"Dispatcher",analyst:"Analyst"};
    roleEl.innerHTML='<span class="role-badge '+(s.role||"analyst")+'">'+(labels[s.role]||s.role)+'</span>';
  }
  var userEl=document.getElementById("navUser");
  if(userEl) userEl.textContent=s.name;
}

// ==================== Visibility by Role ====================
function applyRoleVisibility(){
  var role=getRole();
  // Hide form panels for restricted roles
  var vehForm=document.getElementById("vehicleFormPanel");
  if(vehForm&&!canManageVehicles()) vehForm.style.display="none";
  var drvForm=document.getElementById("driverFormPanel");
  if(drvForm&&!canManageDrivers()) drvForm.style.display="none";
  var tripForm=document.getElementById("tripFormPanel");
  if(tripForm&&!canManageTrips()) tripForm.style.display="none";
}

// ==================== Search Handlers ====================
function onVehicleSearch(){renderVehicles();}
function onDriverSearch(){renderDrivers();}
function onTripSearch(){renderTrips();}

// ==================== Init ====================
document.addEventListener("DOMContentLoaded",function(){
  // Skip auth check on login page
  var isLogin=document.getElementById("loginCard");
  if(isLogin){hideLoader();return;}

  var session=requireLogin();
  if(!session)return;

  setupNav();
  applyRoleVisibility();
  recalcAllVehicleStatuses();
  updateDashboard();
  renderRoleWelcome();
  renderVehicles();
  renderDrivers();
  loadVehicleDropdown();
  loadDriverDropdown();
  renderTrips();

  var ci=document.getElementById("cargoWeight");if(ci)ci.addEventListener("input",clearCargoError);
  var vs=document.getElementById("vehicleSearch");if(vs)vs.addEventListener("input",onVehicleSearch);
  var ds=document.getElementById("driverSearch");if(ds)ds.addEventListener("input",onDriverSearch);
  var ts=document.getElementById("tripSearch");if(ts)ts.addEventListener("input",onTripSearch);

  hideLoader();
});
