//TODO

/*

  - [] split code
  - [] split set Engine into display, control, and formatter
  - [] Refactor Error handling
  - [] Refactor Operations to handle left and right expressions not just unary ones
  - [] Better access for getting either binary, decimal, or table format
  - [] Table formatting display for sets and truth table
  - [] Add Code for checking health ie. if Subsets of U have elements not in U or also
      if subsets have changed but U has not been informed of changes
*/


type Element = string | number | symbol | " ";
type IndexedArrayOfElements = Array<Element>;
type SetOfElement = Set<Element> | IndexedArrayOfElements;
// type SetOfSets = Set<SetsOfElement> | Array<SetsOfElement>;
export class Operation {
  public static DIFFERENCE : "DIFFERENCE";
  public static COMPLIMENT: "COMPLIMENT";
  public static INTERSECTION:  "INTERSECTION";
  public static UNION: "UNION";
};

class BaseSet {
  name: string;
  valueNumber: number;

  constructor(name:string, value?:number){
    this.name = name;
    this.valueNumber = value ?? 0;
    return this;
  }

  change(newValue: number){
    this.valueNumber = newValue;
  }
}

class Universal{
  private static instance:Universal;
  public elements: IndexedArrayOfElements; //if mutated then checkHealth must fail
  public maxValue: number;
  public wasEdited:boolean;

  public constructor(){
    this.elements = [];
    this.maxValue = 0;
    this.wasEdited = false;
  };

  public checkHealth(){
    // Universal.getInstance();
    // if(!this.connectedSets) return true;
    // this.connectedSets.forEach(set => {
    //   if (set.checkIntegrity()) return false;
    // });
    // return true;
  }

  public static getInstance(){
    if(!this.instance)
      this.instance = new Universal()
    return this.instance
  }
  
  // public static regenerateUniverse(elements: indexedArrayOfElements){
  //   Universal.getInstance()
  //   this.elements = elements;
  //   this.maxValue = 2^(this.elements.length + 1);

  //   //recall all assigned sets and redesignate their number
  // }

  public resetUniverse(){
    this.elements = [];
    this.maxValue = 0;
    this.wasEdited = false;
  }

  public generateUniverse(SingleSet: SetOfElement){
    this.resetUniverse();
    SingleSet.forEach(el => Universal.getInstance().elements.push(el));
    Universal.getInstance().maxValue = Math.pow(2, (Universal.getInstance().elements.length))-1;
    console.log(this.maxValue);
  }

  public encodeUniverseValue(ArrayOfElements: IndexedArrayOfElements){
    
    const universalElements = Universal.getInstance().elements;

    let universeValue:string = "";
    for(let i = 0; i < universalElements.length; i++){
      if(ArrayOfElements.includes(universalElements[i]))
        universeValue += "1";
      else 
        universeValue += "0";
    }
    return parseInt(universeValue,2); //binary to decimal
  }

  public decodeUniverseValue(value: number){
    Universal.getInstance();
    const universeBinaryValue = value.toString(2).padStart(this.elements.length); // decmial to binary
    const universe = Universal.getInstance().elements;
    const elements:IndexedArrayOfElements = new Array<Element>;

    for(let i = 0; i < universe.length; i++)
      if(universeBinaryValue[i] === "1") 
        elements.push(universe[i]) ;

    return elements;
  }
}

export class SetEngine{
  public registeredSets: Map<string, BaseSet>;
  public universal: Universal;
  private hasPopulatedUniverse: boolean;
  // private allClear: boolean;

  constructor(){
    this.registeredSets = new Map();
    this.universal = Universal.getInstance();
    this.hasPopulatedUniverse = false;
    // this.allClear = false;
  }

  debugPrint(): void{
    // console.clear();
    console.log("Set Engine:...");
    console.log("Registed Sets:",this.registeredSets.size);
    console.log("Sets:",...this.registeredSets.keys());

    console.log("For each sets:...")
    Array(...this.registeredSets.keys()).forEach(k => {
      console.log(`-- Set ${k} says:`, this.findSet(k)?.valueNumber);
      console.log(`-- Set ${k} says:`, this.getSetContents(k));
      // console.log(`-- Set ${k} says:`, this.findSet(k)?.valueNumber.toString(2).padEnd(this.universal.elements.length));
    });

    console.log("Universal Set Elements:",...this.universal.elements);
    console.log("Universal Set Max Number",this.universal.maxValue.toString(2).padStart(this.universal.elements.length));
    // console.log("Universal Set Max Number",this.getSetContents());
  }

  registerSet(set:BaseSet){
    if(!this.hasPopulatedUniverse) return console.error("UNIVERSE NOT POPULATED");
    this.registeredSets.set(set.name, set);
  }

  populateUniverseFromOneSet(SetsOfSets:SetOfElement){
    this.universal.resetUniverse();
    this.universal.generateUniverse(SetsOfSets)
    this.hasPopulatedUniverse = true;
  }

  createNewOrChangeBaseSet(name:string, elements?: IndexedArrayOfElements){
    if(!this.hasPopulatedUniverse) return console.error("UNIVERSE NOT POPULATED");
    const set = this.findSet(name) ?? new BaseSet(name);
    if(elements) set.valueNumber = this.universal.encodeUniverseValue(elements);
    this.registerSet(set);
  }

  deriveSet(operation:Operation, name:string){
    if(!this.hasPopulatedUniverse) return console.error("UNIVERSE NOT POPULATED");
    const found = this.findSet(name);
    if(!found) return console.error("NOT FOUND", name);
    switch (operation){
      case Operation.COMPLIMENT: return this.createNewComplimentSet(found);
      default: return;
    }
  }

  createNewComplimentSet(set:BaseSet){
    // console.log("complimented", set.valueNumber.toString(2),"", ~(set.valueNumber).toString(2) )
    const newValue = this.universal.maxValue^(set.valueNumber);
    const name = `${set.name}'`;
    this.registerSet(new BaseSet(name,newValue));
  }

  findSet(name:string){
    return this.registeredSets.get(name);
  }

  getSetContents(name: string){
    const found = this.findSet(name);
    if(!found) return console.error("NOTFOUND");

    return this.universal.decodeUniverseValue(found.valueNumber);
    
  }

  // changeSet(name:string, values:Array<elements>){
  //   const foundSet = this.findSet(name);
  //   if(!foundSet) return;
  //   foundSet.valueNumber.clear();
  //   values.map(e => foundSet.add(e));
  // }

}

// const Engine = new SetEngine();

// Engine.createNewOrChangeBaseSet("A", ["a", "b", "c"]);