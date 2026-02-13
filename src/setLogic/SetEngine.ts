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
  - [] Split BaseSubsets and Derived Subsets
  - [] Better Logging - Throw error instead of silent returns
  - [] Dependency graphing for getting broken sets
*/


type Element = string | number | " ";
type IndexedArrayOfElements = Array<Element>;
type MapOfSets = Map<string, BaseSet>;
type SetOfElements = Set<Element> | IndexedArrayOfElements;

// type SetOfSets = Set<SetsOfElement> | Array<SetsOfElement>;

interface args {
  first:string,
  second?:string,
}

interface ExpressionStructure {
  first: BaseSet;
  second?: BaseSet;
}

export class Operand {
  public static DIFFERENCE    =   "DIFFERENCE";
  public static COMPLIMENT    =   "COMPLIMENT";
  public static INTERSECTION  =   "INTERSECTION";
  public static UNION         =   "UNION";
};

interface formatInteface{
  name: string,
  prefix?: string,
}

class FORMAT {
  public static BINARY:formatInteface = {name: "BINARY", prefix: "0b"};
  public static DECIMAL:formatInteface = {name: "DECIMAL", prefix: "0d"};
}

class BaseSet{
  name: string;
  valueNumber:number;
  derived:boolean;
  dependents: MapOfSets;

  constructor(name: string, valueNumber?: number){
    this.name = name;
    this.valueNumber = valueNumber ?? 0;
    this.derived = false;
    this.dependents = new Map();

  }


  addDependent(dependent: BaseSet){
    this.dependents.set(dependent.name, dependent);
  }

  getValue(format: string = FORMAT.DECIMAL.name, prefixed: boolean = false, padding:number = 0){
    switch(format){
      case FORMAT.BINARY.name: return `${prefixed ? FORMAT.BINARY.prefix : ""}${this.valueNumber.toString(2).padStart(padding,'0')}`;
      case FORMAT.DECIMAL.name: return `${prefixed ? FORMAT.DECIMAL.prefix : ""}${this.valueNumber.toString()}`;
    }
    
  }

  // change(newValue: number){
  //   this.valueNumber = newValue;
  // }
}

class Universal{
  private static instance:Universal;
  public setData: BaseSet;
  public elements: IndexedArrayOfElements;
  public maxValue: number;
  public populated:boolean;

  public constructor(){
    this.setData = new BaseSet("U");
    this.elements = [];
    this.maxValue = 0;
    this.populated = false;
  };

  public checkHealth(){}

  public static getInstance(){
    if(!this.instance)
      this.instance = new Universal()
    return this.instance
  }

  public resetUniverse(){
    this.elements = [];
    this.maxValue = 0;
    this.populated = false;
  }

  public generateUniverse(SingleSet: SetOfElements){
    this.resetUniverse();
    SingleSet.forEach(el => Universal.getInstance().elements.push(el));

    const value = Math.pow(2, (Universal.getInstance().elements.length))-1
    Universal.getInstance().maxValue = value;
    this.setData.valueNumber = value;
    this.populated = true;
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
  public registeredSets: MapOfSets;
  public universal: Universal;
  private hasPopulatedUniverse: boolean;

  constructor(){
    this.registeredSets = new Map();
    this.universal = Universal.getInstance();
    this.hasPopulatedUniverse = false;
  }

  public debugPrint(): void{
    console.log("Set Engine:...");
    console.log("Registed Sets:",this.registeredSets.size);
    console.log("Sets:",this.printableSetKeyStream());

    console.log("For each sets:...")
    Array(...this.registeredSets.keys()).forEach(k => {
      console.log(
        `-- Set ${k} says:`, 
        this.findSet(k)?.getValue(FORMAT.DECIMAL.name, true), 
        this.findSet(k)?.getValue(FORMAT.BINARY.name, true),
        ...this.getSetContents(k)
      );
    });

    console.log("Universal Set Elements:",...this.universal.elements);
    console.log("Universal Set Max Number",this.universal.maxValue.toString(2).padStart(this.universal.elements.length));
    
      const table = Array.from(this.registeredSets.values()).map(set=>{
        return{
          "Name": set.name,
          ...set.getValue(FORMAT.BINARY.name,false,this.universal.elements.length)?.split("")
        }
      })

    console.table(table);
  }

  private printableSetKeyStream(){
    return Array(...this.registeredSets.keys());
  }

  private register(set:BaseSet){
    if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");
    this.registeredSets.set(this.nameFormatter(set.name),set);
  }
  
  findSet(name:string){
    return this.registeredSets.get(this.nameFormatter(name));
  }

  findSetOrFail(name:string){
    const found = this.findSet(name);
    if(!found) throw new Error(`${found} NOT FOUND`);
    return found;
  }

  private nameFormatter(name:string){
    return name.trim().toUpperCase();
  }

  populateUniverseFromOneSet(SetsOfSets:SetOfElements){
    console.log("Reset Universe");
    this.universal.resetUniverse();
    this.universal.generateUniverse(SetsOfSets);
    console.log("Populated Universe");
    this.hasPopulatedUniverse = true;
    this.register(this.universal.setData);
  }

  createNewOrChangeBaseSet(name:string, elements?: IndexedArrayOfElements){
    if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");

    let found = this.findSet(name);
    if(!found) {
      found = new BaseSet(name, 0);
    }

    if(elements) found.valueNumber = this.universal.encodeUniverseValue(elements);
    this.register(found);
  }

  deriveSet(operation: Operand, {first, second}:args){
    if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");

    const firstFoundArg = this.findSetOrFail(first);
    
    let secondsFoundArg = operation === Operand.COMPLIMENT ? this.findSet(this.universal.setData.name): undefined;
    if(second){
      secondsFoundArg = this.findSetOrFail(second);
    }

    const expression: ExpressionStructure = {first: firstFoundArg, second: secondsFoundArg};
    switch (operation){
      case Operand.COMPLIMENT:   return this.createNewComplimentSet(expression);
      case Operand.INTERSECTION: return this.createNewIntersectionSet(expression);
      case Operand.UNION:        return this.createNewUnion(expression);
      case Operand.DIFFERENCE:   return this.createNewDifference(expression);
      default: return;
    }
  }

  private createNewComplimentSet(set:ExpressionStructure){
    const {first} = set;
    const newValue = this.universal.maxValue^(first.valueNumber);
    
    const name = `${first.name}'`;
    this.createNewOrChangeBaseSet(name, this.universal.decodeUniverseValue(newValue));
  }

  private createNewIntersectionSet(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber & second.valueNumber ;
    const name = `(${first.name} ∩ ${second?.name})`;
    this.createNewOrChangeBaseSet(name, this.universal.decodeUniverseValue(newValue));
  }

  private createNewUnion(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber | second.valueNumber ;
    const name = `(${first.name} ∪ ${second?.name})`;
    this.createNewOrChangeBaseSet(name, this.universal.decodeUniverseValue(newValue));
  }

  private createNewDifference(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber ^ second.valueNumber ;
    const name = `(${first.name} \\ ${second?.name})`;
    this.createNewOrChangeBaseSet(name, this.universal.decodeUniverseValue(newValue));
  }


  getSetContents(name: string){
    const found = this.findSetOrFail(name);
    return this.universal.decodeUniverseValue(found.valueNumber);
  }

  // changeSet(name:string, values:Array<elements>){
  //   const foundSet = this.findSet(name);
  //   if(!foundSet) return;
  //   foundSet.valueNumber.clear();
  //   values.map(e => foundSet.add(e));
  // }

}

// class SetErrorHandler{
  
// }


// const Engine = new SetEngine();

// Engine.createNewOrChangeBaseSet("A", ["a", "b", "c"]);