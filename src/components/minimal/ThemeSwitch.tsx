import { useDarkMode } from '../../contexts/DarkModeContext';

/** Single round toggle: light <-> dark (starts from the visitor's system setting). */
const ThemeSwitch = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <button type="button" className="theme-btn" onClick={toggleDarkMode} aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
      <span className="theme-icon" aria-hidden="true" />
      {isDarkMode ? 'Light mode' : 'Dark mode'}
    </button>
  );
};

export default ThemeSwitch;
