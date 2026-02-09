import {} from "bootstrap-icons/font/bootstrap-icons.css";
import { useState } from "react";

type Theme = 'light' | 'dark';

function setTheme(theme: Theme){
  document.documentElement.setAttribute('data-bs-theme', theme);
}

function toggle(data:Theme, mutator: (theme:Theme)=>void){
  if(data === "dark")
    mutator("light")
  else 
    mutator('dark');

  setTheme(data);
}

const Header = () => {
  const [theme, toggleTheme] = useState<Theme>('dark');
  return(
    <header className="py-3 mb-3 border-bottom bg-primary-subtle container-fluid">
      <div className="container-fluid d-grid gap-3 align-items-center" style={{"gridTemplateColumns": "1fr 2fr"}}>
        <div className="dropdown">
          <a href="#" className="d-flex align-items-center col-lg-4 mb-2 mb-lg-0 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
            <h1>Set Theory</h1>
          </a>
          <ul className="dropdown-menu text-small shadow">
            <li>
              <a href="#" className="dropdown-item active">Set Writer</a>
            </li>
            <li>
              <a href="#" className="dropdown-item disabled">TBA</a>
            </li>
            <li>
              <a href="#" className="dropdown-item  disabled">TBA</a>
            </li>
          </ul>
        </div>
        <div className="d-flex align-items-center">
          <form role="search" className="w-100 me-3">
            <input type="search" className="form-control bg-light-subtle" placeholder="Search..." />
          </form>
          <button 
            type="button" 
            className="btn btn-secondary rounded me-3"
            onClick={()=>toggle(theme, toggleTheme)}
          >
            <i className={theme==="dark" ? "bi bi-moon" : "bi bi-sun"} />
          </button>
          <div className="dropdown">
            <a href="#" className="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">Menu</a>
            <ul className="dropdown-menu text-small shadow">
              <li >
                <button type="button" className="dropdown-item btn btn-secondary disabled">Clear	</button>
                <button type="button" className="dropdown-item btn btn-secondary disabled">Export</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header;