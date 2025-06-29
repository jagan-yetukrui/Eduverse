import {
  FaGithub,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import placeholder from "../images/placeholder.png";
// Project Card Component
const ProjectCard = ({ project }) => {
    return (
        <motion.div
            className="project-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)" }}
            transition={{ duration: 0.3 }}
        >
            <img
                src={project.project_image || project.project_image_url || project.image || placeholder}
                alt={project.title}
                className="project-image"
            />
            <div className="project-overlay">
                <div className="project-links">
                    {project.github && (
                        <motion.a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaGithub />
                        </motion.a>
                    )}
                    {project.liveUrl && (
                        <motion.a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaExternalLinkAlt />
                        </motion.a>
                    )}
                </div>
            </div>
            <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tags">
                    {project.tags?.map((tag, index) => (
                        <motion.span
                            key={index}
                            className="project-tag"
                            whileHover={{ scale: 1.05 }}
                        >
                            {tag}
                        </motion.span>
                    ))}
                </div>
            </div>
        </motion.div>
    )
};

export default ProjectCard;