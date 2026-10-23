import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectList from '../components/minimal/ProjectList';
import { fadeUp } from '../components/minimal/Section';

const AllProjects = () => {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className="page page-wide">
      <Link to="/#projects" className="arrow-link">← home</Link>
      <h1 style={fadeUp(0).style} className="fade-up page-title mt-8">projects</h1>
      <p style={fadeUp(1).style} className="fade-up muted mt-4 text-[15px]">
        Everything I've built — apps, web systems and experiments. Live demos use sample data.
      </p>
      <div style={fadeUp(2).style} className="fade-up mt-10">
        <ProjectList />
      </div>
    </div>
  );
};

export default AllProjects;
