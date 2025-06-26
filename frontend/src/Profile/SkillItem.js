import React from "react";
import { motion } from "framer-motion";

export const SkillItem = ({ skill }) => {
    return (
        <motion.div
            className="skill-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <div className="skill-header">
                <h4 className="skill-name">{skill.name}</h4>
                <span className="skill-level">{skill.level}%</span>
            </div>
            <div className="skill-bar">
                <motion.div
                    className="skill-progress"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    title={`${skill.level}% proficiency`}
                />
            </div>
        </motion.div>
    )
};

export default SkillItem;