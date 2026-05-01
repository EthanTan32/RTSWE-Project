"use client"

import React, { useState, useEffect } from 'react';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mealsData, setMealsData] = useState([]);

  // Progress Tracker State
  const [plate, setPlate] = useState([]); 
  const [calorieGoal, setCalorieGoal] = useState(1800); 

  // Macro Goal States
  const [proteinGoal, setProteinGoal] = useState(130);
  const [carbsGoal, setCarbsGoal] = useState(200);
  const [fatGoal, setFatGoal] = useState(60);

  // Favorites State (Loads from localStorage if available) ---
  const [savedPlates, setSavedPlates] = useState(() => {
    // Check if we are in the browser and if there is saved data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scarletPlateFavorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [favoriteName, setFavoriteName] = useState("");

  // Calories math
  const currentCalories = plate.reduce((total, meal) => total + (meal.calories || 0), 0);
  const progressPercentage = Math.min((currentCalories / calorieGoal) * 100, 100) || 0;

  // Macro Calculations
  const totalProtein = plate.reduce((total, meal) => total + (meal.macros?.protein || 0), 0);
  const totalCarbs = plate.reduce((total, meal) => total + (meal.macros?.carbs || 0), 0);
  const totalFat = plate.reduce((total, meal) => total + (meal.macros?.fat || 0), 0);
 
  // Individual Macro Progress Percentages
  const proteinProgress = Math.min((totalProtein / proteinGoal) * 100, 100) || 0;
  const carbsProgress = Math.min((totalCarbs / carbsGoal) * 100, 100) || 0;
  const fatProgress = Math.min((totalFat / fatGoal) * 100, 100) || 0;

  // Smart Recommendation Engine
  
  // 1. Calculate what the user still needs
  const remainingCalories = calorieGoal - currentCalories;
  const remainingProtein = proteinGoal - totalProtein;
  const remainingCarbs = carbsGoal - totalCarbs;

  // 2. The Scoring Function
  const getRecommendations = () => {
    // If the data hasn't loaded, or the plate is already full, don't show anything
    if (!mealsData || mealsData.length === 0 || remainingCalories < 100) return [];

    // Get IDs of items already on the plate so we don't recommend duplicates
    const plateIds = plate.map(item => item.id);
    const availableMeals = mealsData.filter(m => !plateIds.includes(m.id));

    // Grade every meal
    const scoredMeals = availableMeals.map(meal => {
      let score = 0;

      // Rule 1: Calorie Budget (Heavy Weight)
      if (meal.calories <= remainingCalories) {
        score += 15; // Fits perfectly
      } else if (meal.calories <= remainingCalories + 100) {
        score -= 5; // Slightly over budget
      } else {
        score -= 50; // Massively over budget, penalize heavily
      }

      // Rule 2: Protein Priority
      // If they are missing a lot of protein, highly reward high-protein meals
      if (remainingProtein > 20 && meal.macros?.protein > 15) {
        score += 10; 
      }

      // Rule 3: Carb Balancing
      // If they need carbs, reward carbs. If they are over, penalize high carbs.
      if (remainingCarbs > 30 && meal.macros?.carbs > 20) {
        score += 5;
      } else if (remainingCarbs < 0 && meal.macros?.carbs > 30) {
        score -= 10; 
      }

      return { ...meal, recommendationScore: score };
    });

    // Sort by the highest score, and grab the top 3 meals
    const topPicks = scoredMeals
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);

    return topPicks;
  };

  const recommendedMeals = getRecommendations();

  useEffect(() => {
    async function fetchMeals() {
      try {
        const res = await fetch("/api/format");
        const data = await res.json();
        setMealsData(data);
      } catch (error) {
        console.error("Error fetching meals:", error);
      }
    }
    fetchMeals();
  }, []);

  // Save favorites to Local Storage whenever they change ---
  useEffect(() => {
    localStorage.setItem('scarletPlateFavorites', JSON.stringify(savedPlates));
  }, [savedPlates]);

  // Handlers for Favorites 
  const handleSaveFavorite = () => {
    if (plate.length === 0) return;
    const newFavorite = {
      id: Date.now(), // Unique ID based on timestamp
      name: favoriteName.trim() === "" ? `Saved Meal ${savedPlates.length + 1}` : favoriteName,
      items: [...plate], // Copy current plate items
      totalCalories: currentCalories
    };
    setSavedPlates([...savedPlates, newFavorite]);
    setFavoriteName(""); // Clear input
  };

  const handleDeleteFavorite = (id) => {
    setSavedPlates(savedPlates.filter(fav => fav.id !== id));
  };


  // Filters the list as they type
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

      {/* Tracker & Favorites UI Section */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-8">
          
          {/* Main Tracker Card */}
          <div className="card border-0 shadow-sm p-4 mb-4">
            
            {/* Calorie Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold">Daily Tracker</h5>
              <div className="d-flex align-items-center">
                <label className="me-2 text-muted small mb-0">Calorie Goal:</label>
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

            {/* Individual Macro Trackers */}
            <div className="mb-4 bg-light p-3 rounded border">
              <h6 className="fw-bold text-center mb-3">Macro Goals</h6>
              
              {/* Protein Row */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-info">Protein: {Math.round(totalProtein)}g</span>
                  <div className="d-flex align-items-center">
                    <label className="me-2 text-muted" style={{fontSize: '0.75rem'}}>Goal (g):</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm p-1 text-center" 
                      style={{ width: '55px', fontSize: '0.8rem' }}
                      value={proteinGoal} 
                      onChange={(e) => setProteinGoal(Number(e.target.value))} 
                    />
                  </div>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${totalProtein > proteinGoal ? 'bg-danger' : 'bg-info'}`} 
                    style={{ width: `${proteinProgress}%`, transition: 'width 0.5s ease-in-out' }}
                  ></div>
                </div>
              </div>

              {/* Carbs Row */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-warning" style={{ color: '#d97706' }}>Carbs: {Math.round(totalCarbs)}g</span>
                  <div className="d-flex align-items-center">
                    <label className="me-2 text-muted" style={{fontSize: '0.75rem'}}>Goal (g):</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm p-1 text-center" 
                      style={{ width: '55px', fontSize: '0.8rem' }}
                      value={carbsGoal} 
                      onChange={(e) => setCarbsGoal(Number(e.target.value))} 
                    />
                  </div>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${totalCarbs > carbsGoal ? 'bg-danger' : 'bg-warning'}`} 
                    style={{ width: `${carbsProgress}%`, transition: 'width 0.5s ease-in-out' }}
                  ></div>
                </div>
              </div>

              {/* Fat Row */}
              <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-danger">Fat: {Math.round(totalFat)}g</span>
                  <div className="d-flex align-items-center">
                    <label className="me-2 text-muted" style={{fontSize: '0.75rem'}}>Goal (g):</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm p-1 text-center" 
                      style={{ width: '55px', fontSize: '0.8rem' }}
                      value={fatGoal} 
                      onChange={(e) => setFatGoal(Number(e.target.value))} 
                    />
                  </div>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${totalFat > fatGoal ? 'bg-dark' : 'bg-danger'}`} 
                    style={{ width: `${fatProgress}%`, transition: 'width 0.5s ease-in-out' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Show items added to the plate & Save Feature */}
            {plate.length > 0 && (
              <div>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted fw-bold d-block">Currently on your plate:</small>
                  <button className="btn btn-link text-danger btn-sm p-0" onClick={() => setPlate([])}>Clear Plate</button>
                </div>
                
                <div className="d-flex flex-wrap gap-2 mb-3">
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

                {/* --- NEW: Save Plate Input area --- */}
                <div className="input-group input-group-sm mb-2">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Name this meal (e.g. Go-To Busch Lunch)" 
                    value={favoriteName}
                    onChange={(e) => setFavoriteName(e.target.value)}
                  />
                  <button className="btn btn-danger" type="button" onClick={handleSaveFavorite}>
                    Save as Favorite
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* --- NEW: Favorite Meals Card --- */}
          {savedPlates.length > 0 && (
            <div className="card border-0 shadow-sm p-4">
               <h5 className="mb-3 fw-bold">My Saved Meals</h5>
               <div className="row g-2">
                 {savedPlates.map(fav => (
                   <div className="col-12 col-sm-6" key={fav.id}>
                     <div className="border rounded p-3 bg-white position-relative">
                       <div className="d-flex justify-content-between align-items-start mb-2">
                         <h6 className="fw-bold mb-0 text-truncate pe-3">{fav.name}</h6>
                         <button 
                           className="btn-close" 
                           style={{ fontSize: '0.6rem', position: 'absolute', top: '10px', right: '10px' }} 
                           onClick={() => handleDeleteFavorite(fav.id)}
                         ></button>
                       </div>
                       <p className="text-muted small mb-2">{fav.items.length} items • {fav.totalCalories} Cal</p>
                       <button 
                         className="btn btn-outline-danger btn-sm w-100"
                         onClick={() => setPlate([...fav.items])} // Loads the saved plate
                       >
                         Load Plate
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
          {/* ======================================== */}

        </div>
      </div>

      {/* --- NEW: Smart Recommendations UI --- */}
      {recommendedMeals.length > 0 && currentCalories > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-warning text-dark me-2 p-2">✨ Smart Suggestions</span>
              <h5 className="mb-0 fw-bold text-muted">Based on your remaining goals</h5>
            </div>
            
            <div className="row g-3">
              {recommendedMeals.map(meal => (
                <div className="col-12 col-md-4" key={`rec-${meal.id}`}>
                  <div className="card h-100 border-warning shadow-sm" style={{ borderWidth: '2px' }}>
                    <div className="card-body bg-light">
                      <div className="d-flex justify-content-between">
                        <h5 className="card-title fw-bold">{meal.name}</h5>
                        <span className="badge bg-warning text-dark">{meal.calories} Cal</span>
                      </div>
                      <h6 className="card-subtitle mb-2 text-secondary">{meal.hall}</h6>
                      <p className="small text-muted mb-0">
                        Protein: {meal.macros?.protein}g • Carbs: {meal.macros?.carbs}g
                      </p>
                    </div>
                    
                    <div className="card-footer bg-white border-0 d-flex justify-content-end pb-3">
                      <button 
                        className="btn btn-warning btn-sm fw-bold"
                        onClick={() => setPlate([...plate, meal])}
                      >
                        + Add to Plate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ======================================== */}

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
