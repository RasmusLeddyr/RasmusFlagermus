// (cl = classlist)

export function cl(styles, moduleClasslist = "", globalClasslist = "") {
  // If "styles" exists; run code.
  if (styles) {
    // Turn moduleClasslist to real module classes. Remove double spaces.
    const mc = moduleClasslist
      .split(/\s+/) // Split by space. (Removes all spaces.)
      .map((i) => styles[i]) // Convert to module classes. (Empty if class is invalid.)
      .filter(Boolean) // Delete empty strings.
      .join(" "); // Join with space.

    // Remove double-spaces from globalClasslist.
    const gc = globalClasslist.split(/\s+/).filter(Boolean).join(" ");

    // Combine module and global classes.
    const classlist = `${mc} ${gc}`;

    // Trim in case one classlist is empty.
    return classlist.trim();
  }
}
