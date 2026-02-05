'use strict'

const $ = document;
const sets = {
  U: new Set(),
}

const setNames = new Set("U");
const parentDiv = $.getElementById("sets");

/* === Set Logic === */
function AddOrCreate(setName, contents){
  setNames.add(setName); //enrolls setName into list
  
  if(!(setName in sets)) 
   sets[setName] = new Set();  
  
  for(let setItem of contents){
    setItem = String(setItem).trim().toLowerCase();
    sets["U"].add(setItem);
    sets[setName].add(setItem);
  }
}

function CreateComplimentFrom(setName){
  const sanitizedName = setName.toUpperCase();
  AddOrCreate(`${sanitizedName}'`, sets.U.difference(sets[sanitizedName]));
}

function Intersection(setNameOne, setNameTwo){
  AddOrCreate(`${setNameOne} ∩ ${setNameTwo}`, sets[setNameOne].intersection(sets[setNameTwo]));
}

/* === Set Setup === */
//todo:
// [] add control in ui instead of hard coding
AddOrCreate("A", [1,2,3]);
AddOrCreate("B", ["A","b","c"]);
AddOrCreate("C", [10,11,12,3,2,1]);
CreateComplimentFrom("B");
Intersection("A", "B");
Intersection("A", "C");
printSets();

/* === HTML Logic === */
function divHelper(id){
  const div = $.createElement("div");
  div.id = id;
  return div;
}


function setElHelper(set, name, {appendToParent, parent, parenthesized}={appendToParent:true, parent: parentDiv, parenthesized:false}){
  const div = divHelper(name);
  div.innerHTML = `${name} = {`;
  if(set.size === 0) {
    div.innerHTML += "Ø}";
    
  }else{
    let i = 1;
    for(const item of set) {
      const itemString = String(item).toLowerCase();
      div.innerHTML += parenthesized ? `'${itemString}'` : itemString;
      (i++ < set.size) && (div.innerHTML += ", ");
    }

    div.innerHTML += "}";
  }

  return appendToParent ? parent.appendChild(div) : div;
}

function printSets(){
  for(const name of setNames){
    if (name === "setNames") continue;
    setElHelper(sets[name], name);
  }
}
