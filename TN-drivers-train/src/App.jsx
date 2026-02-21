// import Sidebar from "./components/Sidebar";
// import AppRoutes from "./routes/AppRoutes";

// function App() {
//   return (
//     <div className="flex h-screen bg-slate-50 dark:bg-slate-950 
//                     text-slate-900 dark:text-slate-100">


//       {/* Page Content */}
//       <div className="flex-1 overflow-y-auto p-6">
//         <AppRoutes />
//       </div>

//     </div>
//   );
// }

// export default App;

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark 
                    text-slate-900 dark:text-slate-100 
                    antialiased flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Right Side Layout */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <AppRoutes />
        </div>

      </div>
    </div>
  );
}

export default App;