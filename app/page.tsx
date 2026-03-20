"use client"

import React, { useState, useEffect } from 'react';
import mealsData from './meals.json';





function App() {
 const [searchTerm, setSearchTerm] = useState("");
 /*
  const [mealsData, setMealsData] = useState("");

  useEffect(() => {
    async function format() {
      const res = await fetch("/api/format");
      const data = await res.json()
      setMealsData(data)
    }

  })
*/

 // filters the list as they type
 const filteredMeals = mealsData.filter(meal => {
  const search = searchTerm.toLowerCase();
  
  //Check name or hall
  const matchesName = meal.name.toLowerCase().includes(search);
  const matchesHall = meal.hall.toLowerCase().includes(search);
  
  //Check macronutrients (proteins, carbs, fats)
  const matchesMacros = Object.keys(meal.macros).some(key => 
    key.toLowerCase().includes(search) && meal.macros[key] > 0
  );

  //Check dietary tags (Vegan, Gluten-Free, Vegetaraian)
  const matchesDietary = meal.dietary.some(tag => 
    tag.toLowerCase().includes(search)
  );

  return matchesName || matchesHall || matchesMacros || matchesDietary;
});

 return (
   <div className="container-fluid bg-light min-vh-100 p-3">
     {/* Header Section */}
     <header className="text-center mb-4">
       <h1 className="display-6 fw-bold text-danger">RU Dining Helper</h1>
       <p className="text-muted">Healthy Campus Eats</p>
     </header>

     {/* Search Bar Section */}
     <div className="row justify-content-center mb-4">
       <div className="col-md-6">
         <input
           type="text"
           className="form-control form-control-lg shadow-sm"
           placeholder="Search for dining hall, specific food options, or dietary goals..."
           onChange={(e) => setSearchTerm(e.target.value)}
         />
       </div>
     </div>


     {/* Results Section */}
     <div className="row g-3">
       {filteredMeals.map(meal => (
         <div className="col-12 col-md-4" key={meal.id}>
           <div className="card h-100 border-0 shadow-sm">
             <div className="card-body">
               <div className="d-flex justify-content-between">
                 <h5 className="card-title fw-bold">{meal.name}</h5>
                 <span className="badge bg-info text-dark">{meal.calories} Cal</span>
               </div>
               <h6 className="card-subtitle mb-3 text-secondary">{meal.hall}</h6>
              
               {/* Dietary Tags */}
               <div>
                 {meal.dietary.map(tag => (
                   <span key={tag} className="badge rounded-pill bg-success me-1">{tag}</span>
                 ))}
               </div>
             </div>
             <div className="card-footer bg-white border-0 text-end">
               <button className="btn btn-outline-danger btn-sm">View Macros</button>
             </div>
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}

export default App;
