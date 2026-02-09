// import { useEffect, useState } from "react";

// enum operations {
//   DIFFERENCE,
//   UNION,
//   INTERSECTION,
//   COMPLIMENT
// }

const SetOperator = () =>{
  // const [sets, setSets] = useState([]);
  // const [first, setFirst] = useState(sets[0]);
  // const [second, setSecond] = useState(sets[0]);
  // const [activeOperation, setActiveOperation] = useState(operations.DIFFERENCE);
  return(
    <div className="row g-2 align-items-center">
      <div className="col-2">
        <input className="form-control text-muted" name="setName1" type="text" placeholder="Name..." value="A \ B" readOnly />
      </div>
      
      <div className="col-5 d-grid">
        <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">Difference</button>
        <ul className="dropdown-menu">
          <li><button type="button" className={`btn btn-secondary dropdown-item`}>Difference</button></li>
          <li><button type="button" className={`btn btn-secondary dropdown-item`}>Union</button></li>
          <li><button type="button" className={`btn btn-secondary dropdown-item`}>Intersection</button></li>
          <li><button type="button" className={`btn btn-secondary dropdown-item`}>Compliment</button></li>
        </ul>
      </div>
      
      <div className="col-1 d-grid">
        <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">A</button>
        <ul className="dropdown-menu">
          {/* <!-- dynamic data --> */}
          <li><button type="button" className="btn btn-primary dropdown-item active">A</button></li>
          <li><button type="button" className="btn btn-primary dropdown-item">B</button></li>
        </ul>
      </div>
      
      <div className="col-1 d-grid">
        <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">B</button>
        <ul className="dropdown-menu">
          {/* dynamic data  */}
          <li><button type="button" className="btn btn-primary dropdown-item">A</button></li>
          <li><button type="button" className="btn btn-primary dropdown-item active">B</button></li>
        </ul>
      </div>	

      <div className="col-3 d-grid">
        <button type="button" className="btn btn-primary">Add</button>
      </div>	

    </div>
  )
}

export default SetOperator;