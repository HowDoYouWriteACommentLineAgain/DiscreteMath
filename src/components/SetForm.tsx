import { useState } from "react";

interface Props{
  name?: string,
  values?: (string|number)[],
  action?:Action
  opt?:Opt
}

interface Opt{
  readonly: boolean,
  color?:'primary' | 'danger'
}

interface Action{
  name: string,
  action?: ()=>void
}

const SetForm = (props:Props) => {
  const {name:_name, values:_values, action:_action, opt:_opt} = props;
  const [name, setName] = useState( _name ??'');
  //TODO replace with a better formatter and validator
  const [values, setValues] = useState(
    _values?.reduceRight(
      (e,s,i) => s += (i<=_values.length ? "," : "") + String(e)
    ) ?? ""
  );
  const action = _action ?? null;
  const readOnly = _opt?.readonly ?? false;
  const color = _opt?.color ?? 'primary';
  const form_class = `form-control${readOnly?" text-muted":""}`;
  return(
    <div className="row g-2 align-items-center ms-2 mb-1">
      <div className="col-2">
        <input 
          className={form_class}
          type="text" 
          placeholder="Name..."
          value={name}
          onChange={(e)=>setName(e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="col-7">
        <input 
          className={form_class}
          type="text" 
          placeholder="Comma separated values..." 
          value={values}
          onChange={(e)=>setValues(e.target.value)}
          readOnly={readOnly}
          id={`Set-${name}`}
        />
      </div>
      {
      action! && (<div className="col-3">
        <button 
          type="button" 
          className={`btn btn-${color}`}
        >{action?.name}
        </button>
      </div>)
      }
    </div>
  )
}

export default SetForm;