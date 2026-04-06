export function RoleSwitcher({ role, onRoleChange, theme, onThemeChange }) {
  return (
    <div className="role-switcher card">
      <label htmlFor="role-select">Role</label>
      <select id="role-select" value={role} onChange={(e) => onRoleChange(e.target.value)}>
        <option value="viewer">Viewer</option>
        <option value="admin">Admin</option>
      </select>
      <div className="toggle-row">
        <label htmlFor="theme-select">Theme</label>
        <select id="theme-select" value={theme} onChange={(e) => onThemeChange(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <p>{role === 'admin' ? 'Admin can add transactions.' : 'Viewer has read-only access.'}</p>
    </div>
  )
}
