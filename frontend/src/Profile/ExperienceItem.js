import { motion } from "framer-motion";
import placeholder from "../images/placeholder.png";
const ExperienceItem = ({ experience }) => {return (
  <motion.div
    className="experience-item"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: 10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="experience-logo">
      <img src={experience.companyLogo || placeholder} alt={experience.company} />
    </div>
    <div className="experience-content">
      <h4 className="experience-company">{experience.company}</h4>
      <p className="experience-position">{experience.position}</p>
      <p className="experience-duration">{experience.duration}</p>
      <p className="experience-description">{experience.description}</p>
    </div>
  </motion.div>
)};

export default ExperienceItem;