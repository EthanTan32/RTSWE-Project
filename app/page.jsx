"use client"

import React, { useState, useEffect } from 'react';
//import mealsData from './meals.json';

function App() {
 const [searchTerm, setSearchTerm] = useState("");
 const [mealsData, setMealsData] = useState([]);

 //Progress Tracker State
 const [plate, setPlate] = useState([]); 
 const [calorieGoal, setCalorieGoal] = useState(1800); 

 //Calories math
 const currentCalories = plate.reduce((total, meal) => total + (meal.calories || 0), 0);
 const progressPercentage = Math.min((currentCalories / calorieGoal) * 100, 100);

 //Macro Calculations
 //Calculate the total grams of each macro on the plate
 const totalProtein = plate.reduce((total, meal) => total + (meal.macros?.protein || 0), 0);
 const totalCarbs = plate.reduce((total, meal) => total + (meal.macros?.carbs || 0), 0);
 const totalFat = plate.reduce((total, meal) => total + (meal.macros?.fat || 0), 0);
 
 //Calculate the total grams combined to find the percentages
 const totalMacros = totalProtein + totalCarbs + totalFat;
 const proteinPercent = totalMacros > 0 ? (totalProtein / totalMacros) * 100 : 0;
 const carbsPercent = totalMacros > 0 ? (totalCarbs / totalMacros) * 100 : 0;
 const fatPercent = totalMacros > 0 ? (totalFat / totalMacros) * 100 : 0;

  useEffect(() => {
    async function fetchMeals() {
      const res = await fetch("/api/format");
      const data = await res.json();
      setMealsData(data);
    }
    fetchMeals();
  }, []);

 //filters the list as they type
 const filteredMeals = mealsData && mealsData.length > 0 ? mealsData.filter(meal => {
  const search = searchTerm.toLowerCase();
  
  const matchesName = meal.name.toLowerCase().includes(search);
  const matchesHall = meal.hall.toLowerCase().includes(search);
  
  const matchesMacros = meal.macros && Object.keys(meal.macros).some(key => 
    key.toLowerCase().includes(search) && meal.macros[key] > 0
  );

  const matchesDietary = meal.dietary && meal.dietary.some(tag => 
    tag.toLowerCase().includes(search)
  );

  return matchesName || matchesHall || matchesMacros || matchesDietary;
}) : [];

 return (
   <div className="container-fluid bg-light min-vh-100 p-3">
     {/* Header Section */}
     <header className="text-center mb-4">
       <h1 className="display-6 fw-bold text-danger">Scarlet Plate</h1>
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

     {/* Tracker UI Section */}
     <div className="row justify-content-center mb-5">
       <div className="col-md-8">
         <div className="card border-0 shadow-sm p-4">
           <div className="d-flex justify-content-between align-items-center mb-3">
             <h5 className="mb-0 fw-bold">Calorie Tracker</h5>
             <div className="d-flex align-items-center">
               <label className="me-2 text-muted small mb-0">My Goal:</label>
               <input 
                 type="number" 
                 className="form-control form-control-sm" 
                 style={{ width: '80px' }}
                 value={calorieGoal} 
                 onChange={(e) => setCalorieGoal(Number(e.target.value))} 
               />
             </div>
           </div>
           
           {/* Calorie Progress Bar */}
           <div className="progress mb-4" style={{ height: '25px', backgroundColor: '#e9ecef' }}>
             <div 
               className={`progress-bar fw-bold ${currentCalories > calorieGoal ? 'bg-danger' : 'bg-success'}`} 
               role="progressbar" 
               style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}
             >
               {currentCalories} / {calorieGoal} Cal
             </div>
           </div>

           {/*Macro Visualizer UI*/}
           {totalMacros > 0 && (
             <div className="mb-4 bg-light p-3 rounded border">
               <h6 className="fw-bold text-center mb-2">Macro Split</h6>
               
               {/* Multi-Segment Bar */}
               <div className="progress mb-2" style={{ height: '20px' }}>
                 <div className="progress-bar bg-info" style={{ width: `${proteinPercent}%` }} title="Protein"></div>
                 <div className="progress-bar bg-warning text-dark" style={{ width: `${carbsPercent}%` }} title="Carbs"></div>
                 <div className="progress-bar bg-danger" style={{ width: `${fatPercent}%` }} title="Fat"></div>
               </div>
               
               {/* Legend/Labels */}
               <div className="d-flex justify-content-between small fw-bold">
                 <span className="text-info">Protein: {totalProtein}g ({Math.round(proteinPercent)}%)</span>
                 <span className="text-warning">Carbs: {totalCarbs}g ({Math.round(carbsPercent)}%)</span>
                 <span className="text-danger">Fat: {totalFat}g ({Math.round(fatPercent)}%)</span>
               </div>
             </div>
           )}
           {/* ======================================== */}

           {/* Show items added to the meal */}
           {plate.length > 0 && (
             <div>
               <hr />
               <div className="d-flex justify-content-between align-items-center mb-2">
                 <small className="text-muted d-block">Currently on your plate:</small>
                 <button className="btn btn-link text-danger btn-sm p-0" onClick={() => setPlate([])}>Clear Plate</button>
               </div>
               
               <div className="d-flex flex-wrap gap-2">
                 {plate.map((item, index) => (
                   <span key={index} className="badge bg-white text-dark border d-flex align-items-center p-2 shadow-sm">
                     {item.name} ({item.calories} Cal)
                     <button 
                       className="btn-close ms-2" 
                       style={{ fontSize: '0.5rem' }} 
                       onClick={() => {
                         const newPlate = [...plate];
                         newPlate.splice(index, 1);
                         setPlate(newPlate);
                       }}
                     ></button>
                   </span>
                 ))}
               </div>
             </div>
           )}
         </div>
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
                 {meal.dietary && meal.dietary.map(tag => (
                   <span key={tag} className="badge rounded-pill bg-success me-1">{tag}</span>
                 ))}
               </div>
             </div>
             
             <div className="card-footer bg-white border-0 d-flex justify-content-end gap-2 pb-3">
               <button className="btn btn-outline-danger btn-sm">View Macros</button>
               <button 
                 className="btn btn-danger btn-sm"
                 onClick={() => setPlate([...plate, meal])}
               >
                 + Add
               </button>
             </div>
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}

export default App;
