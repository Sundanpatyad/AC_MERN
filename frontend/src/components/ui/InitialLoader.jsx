import React from "react";
import { motion } from "framer-motion";
import "./design.css";

const YourComponent = () => {
  return (
    <div className="h-screen">
      <div className="content w-[100vw] h-[80vh] p-10 flex flex-row align-center justify-center">
        <div className="flex justify-center">
          <div className="A-del1 del"></div>
          <div className="A-del2 del"></div>
          <div className="A-del3 del"></div>
        </div>

        <div className="flex justify-center">
          <div className="C-del1-1 del"></div>
          <div className="C-del1-2 del"></div>
          <div className="C-del2 del"></div>
          <div className="C-del3 del"></div>
          <div className="C-del4 del"></div>
          <div className="C-del5 del"></div>
          <div className="C-del6 del"></div>
          <div className="C-del7 del"></div>
          <div className="C-del8 del"></div>
          <div className="C-del9 del"></div>
        </div>
      </div>
      <motion.div
        className="text-white text-center text-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <h1>Awakening Classes</h1>
      </motion.div>
    </div>
  );
};

export default YourComponent;
