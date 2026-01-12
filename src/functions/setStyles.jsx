// cl = classlist

export function cl(styles, moduleClasslist = "", globalClasslist = "") {
  // Only run code if function is given a "styles" value.
  if (styles) {
    // Turn moduleClasslist into string of true module classes with double-spaces removed.
    const mc = moduleClasslist
      .split(/\s+/) // Split by space. (Removes spaces.)
      .map((i) => styles[i]) // Strings to module classes. (Null if class is invalid.)
      .filter(Boolean) // Delete empty strings.
      .join(" "); // Join strings together with space.

    // Remove double-spaces from globalClasslist.
    const gc = globalClasslist.split(/\s+/).filter(Boolean).join(" ");

    // Combine module and global classes. Trim empty spaces from global classes.
    const classlist = `${mc} ${gc}`;

    // Trim in case one classlist is empty.
    return classlist.trim();
  }
}
