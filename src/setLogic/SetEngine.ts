type Element = string | number | " ";
type MapOfSets = Map<string, BasicSet>;
export type SetOfElements = Set<Element>;
export type Instructions = Array<ExpressionInstruction>;

interface args {
  first:string,
  second?:string,
}

export class ExpressionInstruction{
  operation: OPERAND
  setName1: string
  setName2?: string

  constructor(operation: OPERAND, set1: string, set2?: string){
    this.operation = operation;
    this.setName1 = set1;
    this.setName2 = set2 ?? undefined;
  }
}

interface ExpressionStructure {
  operation: OPERAND;
  first: BasicSet;
  second?: BasicSet;
}

// export enum OPERANDI{

// }

export class OPERAND {
  public static DIFFERENCE    =   "DIFFERENCE";
  public static COMPLEMENT    =   "COMPLIMENT";
  public static INTERSECTION  =   "INTERSECTION";
  public static UNION         =   "UNION";
};

class FORMAT {
  public static BINARY:_formatInteface = {name: "BINARY", prefix: "0b"};
  public static DECIMAL:_formatInteface = {name: "DECIMAL", prefix: "0d"};
  public static NORM_ELEM_ARRAY(arr: Array<string | number>){

    return arr.map(e =>{
      if(arr.length <= 0)return " ";

      if(typeof e === "string")
        return String(e).trim().toLowerCase();

      if(typeof e === "number")
        return e;

      throw new Error(`Invalid Element: ${typeof e}`);
    })
  }
}

interface _formatInteface{
  name: string,
  prefix?: string,
}


export class BasicSet{
  readonly name: string;
  readonly valueNumber:number;

  public constructor(name: string, valueNumber?: number){
    this.name = BasicSet.setNameFormat(name);
    this.valueNumber = valueNumber ?? 0;
  }

  static setNameFormat(name:string){
    return name.trim().toUpperCase();
  }

  getValue(format: string = FORMAT.DECIMAL.name, prefixed: boolean = false, padding:number){
    // if(this.valueNumber === 0) return "∅";
    switch(format){
      case FORMAT.BINARY.name: return `${prefixed ? FORMAT.BINARY.prefix : ""}${this.valueNumber.toString(2).padStart(padding,'0')}`;
      case FORMAT.DECIMAL.name: return `${prefixed ? FORMAT.DECIMAL.prefix : ""}${this.valueNumber.toString()}`;
    }
  }

  static createSetFromArray(name: string, set: SetOfElements, universalSet: UniversalSet): BasicSet{
    const val = UniversalSet.encodeUniverseValue(set, universalSet);
    if(set.size > universalSet.realElements.length) throw new Error("Elements exceeds elements of Universal Set");
    UniversalSet.checkIfElementsOfUniverse(set, universalSet);
    return BasicSet.createNewSetFromVerifiedValue(name, val, universalSet);
  }

  static createNewSetFromVerifiedValue(name: string, val: number, universalSet: UniversalSet): BasicSet{
    if(val > universalSet.maxValue) throw new Error("Value exceeds elements of Universal Set");
    return new BasicSet(name, val);
  }
}

export class SetEngine{
  register: SetRegister;

  public constructor(
    inputRegister: SetRegister,
    OperationInstructions?: Array<ExpressionInstruction>
  ){
    this.register = inputRegister; //init the register which is valid universe
    
    if(OperationInstructions) 
      for(const instruction of OperationInstructions){
        const {setName1, setName2, operation} = instruction;
        this.handleDeriveSet({first:setName1,  second:setName2}, operation);
      }
  }

  
  public result(){
    return this.register;
  }

  public handleDeriveSet(sets:args, operation: OPERAND){

    const argument_one = this.register.findSetOrThrow(sets.first, false)!;
    
    let secondsFoundArg = operation === OPERAND.COMPLEMENT ? this.register.findSetOrThrow(this.register.universalSet.name): undefined;
    if(sets.second){
      secondsFoundArg = this.register.findSetOrThrow(sets.second);
    }

    const expression: ExpressionStructure = {first: argument_one, second: secondsFoundArg, operation: operation};
    switch (expression.operation){
      case OPERAND.COMPLEMENT:   return this.createNewComplementSet(expression);
      case OPERAND.INTERSECTION: return this.createNewIntersectionSet(expression);
      case OPERAND.UNION:        return this.createNewUnion(expression);
      case OPERAND.DIFFERENCE:   return this.createNewDifference(expression);
      default: return;
    }
  }

  private createNewComplementSet(set:ExpressionStructure){
    const {first} = set;
    // const mask = this.register.universalSet.maxValue;
    const newValue = this.register.universalSet.maxValue^(first.valueNumber);
    
    const name = `${first.name}'`;
    this.register = this.register.writeNewSetToRegistry(BasicSet.createNewSetFromVerifiedValue(name, newValue, this.register.universalSet));
  }

  private createNewIntersectionSet(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber & second.valueNumber ;
    const name = `(${first.name} ∩ ${second?.name})`;
    this.register = this.register.writeNewSetToRegistry(BasicSet.createNewSetFromVerifiedValue(name, newValue, this.register.universalSet));
  }

  private createNewUnion(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber | second.valueNumber ;
    const name = `(${first.name} ∪ ${second?.name})`;
    this.register = this.register.writeNewSetToRegistry(BasicSet.createNewSetFromVerifiedValue(name, newValue, this.register.universalSet));
  }

  private createNewDifference(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const mask = this.register.universalSet.maxValue; // makes sure that it trims extra bits from compliement of 2nd val
    const newValue = first.valueNumber & (~second.valueNumber & mask) ;
    const name = `(${first.name} / ${second?.name})`;
    this.register = this.register.writeNewSetToRegistry(BasicSet.createNewSetFromVerifiedValue(name, newValue, this.register.universalSet));
  }

  public debugPrint(): void{
    console.clear();  
    console.log("Set Engine:...");
    console.log("Registed Sets:",this.register.size);
    console.log("Sets:",this.register.printableSetKeyStream());

    console.log("For each sets:...")
    Array(...this.register.keys()).forEach(k => {
      console.log(
        `-- Set ${k} says:`, 
        this.register.findSetOrThrow(k)?.getValue(FORMAT.DECIMAL.name, true, this.register.universalSet.length), 
        this.register.findSetOrThrow(k)?.getValue(FORMAT.BINARY.name, true,this.register.universalSet.length),
        ":",
        ...this.register.getSetContentsOf(k, this.register.universalSet)
      );
    });

    console.log("Universal Set Elements:",...this.register.universalSet.realElements);
    console.log("Universal Set Max Number",this.register.universalSet.maxValue.toString(2).padStart(this.register.universalSet.length));
    
      const table = Array.from(this.register.values()).map(set=>{
        return{
          "Name": set.name,
          ...set.getValue(FORMAT.BINARY.name,false,this.register.universalSet.length)?.split("")
        }
      })

    console.table(table);
  }

}

export class UniversalSet extends BasicSet{
  readonly realElements: Element[];
  readonly maxValue;
  constructor(elements: Element[]){
    const max = Math.pow(2, (elements.length))-1;
    super(BasicSet.setNameFormat("U"), max);
    this.maxValue = max;
    this.realElements = elements; //FORMAT.NORM_ELEM_ARRAY(elements); 
  }

  public get length(){
    return this.realElements.length;
  }

  public static checkIfElementsOfUniverse(set: SetOfElements, universalElements: UniversalSet){
    const U = new Set(universalElements.realElements);
    for(const element of set)
      if(!U.has(element)) throw new Error(`Element '${element}' not part of universe {${universalElements.realElements}}`);
    return true
  }

  public static encodeUniverseValue(arrayOfElements: SetOfElements, universalElements: UniversalSet){
    if(!arrayOfElements || arrayOfElements.size === 0) return 0;

    // const universalElements = this.elements;

    let universeValue:string = "";
    for(const element of universalElements.realElements){
      if(parseInt(universeValue,2) >= universalElements.maxValue)
        continue;

      if(arrayOfElements.has(element))
        universeValue += "1";
      else 
        universeValue += "0";
    }
    return parseInt(universeValue,2); //binary to decimal
  }

  public static decodeUniverseValue(value: number, universalElements: UniversalSet){
    // const universalElements = this.elements;

    if(value === 0) return ["∅"];
    const universeBinaryValue = value.toString(2).padStart(universalElements.length); // decmial to binary
    const universe = universalElements.realElements;
    const elements:SetOfElements = new Set();

    for(let i = 0; i < universe.length; i++)
      if(universeBinaryValue[i] === "1")
        elements.add(universe[i]) ;

    return elements;
  }

}

export class SetRegister{
  public readonly universalSet: UniversalSet;
  private readonly registry: MapOfSets;

  private constructor(registry:MapOfSets, universe: UniversalSet){
    this.universalSet = universe;
    this.registry = registry;
  }
  
  /*CREATION*/
  public static createNewBlankRegistryFromUniverse(universe: UniversalSet){
    return new SetRegister(new Map().set(universe.name, universe), universe)
  }

  /*CREATION*/
  public writeNewSetToRegistry(newSet: BasicSet){
    return new SetRegister(new Map(this.registry).set(newSet.name, newSet), this.universalSet);
  }

  public keys(){
    return this.registry.keys();
  }

  public values(){
    return this.registry.values();
  }

  public get(name: string){
    return this.registry.get(name);
  }

  public get size(){
    return this.registry.size;
  }
  
  private findSetOrUndefined(name:string){
    return this.get(BasicSet.setNameFormat(name));
  }

  public findSetOrThrow(name:string, ignoreNotFound: boolean = false){
    const found = this.findSetOrUndefined(name);
    if(!found && !ignoreNotFound) throw new Error(`Set: '${name}' NOT FOUND from ${Array.from(this.registry.keys())}`);
    return found;
  }

  public printableSetKeyStream(){
    return Array(...this.keys());
  }

  public getSetContentsOf(name: string, universalSet: UniversalSet){
    const found = this.findSetOrThrow(name)!;
    return UniversalSet.decodeUniverseValue(found.valueNumber, universalSet);
  }
  

  // TODO: 
  // - [] name formt checker and method to check if name exists

}