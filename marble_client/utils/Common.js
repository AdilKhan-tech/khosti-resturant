// Common.js

class Common {
  //Truncate Text ====================================
  static truncateText(text, limit = 40) {
    return text?.length > limit ? text.slice(0, limit) + "..." : text || "";
  }

  //date Format =====================================
 static dateFormat(date) {
  if (!date) return "";
  const dateObject = typeof date === "string" ? new Date(date) : date;
  if (!(dateObject instanceof Date && !isNaN(dateObject))) {
    console.error("Invalid date:", date);
    return "";
  }
  // Adjusting for local timezone
  const localTime = new Date(
    dateObject.getTime() - dateObject.getTimezoneOffset() * 60000
  );
  const datePart = localTime.toLocaleDateString("en-CA").replace(/-/g, "/"); // 2026/02/03
  const timePart = localTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }); // 6:28 AM
  return `Published ${datePart} at ${timePart}`;
}


  //handleSortingChange ==============================
  static handleSortingChange = (field, setSortField, setSortOrder) => {
    if (field === Common.sortField) {
      const newSortOrder = Common.sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newSortOrder);
      Common.sortOrder = newSortOrder;
    } else {
      setSortField(field);
      setSortOrder("desc");
      Common.sortField = field;
      Common.sortOrder = "desc";
    }
  };

   // Build Category Tree ==========================
   static buildCategoryTree(categories, parentId = null) {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        children: Common.buildCategoryTree(categories, cat.id),
      }));
  }

  // Flatten Category Tree ========================
  static flattenCategories(categories, level = 0) {
    let result = [];

    categories.forEach(cat => {
      result.push({
        ...cat,
        level,
      });

      if (cat.children?.length) {
        result = result.concat(
          Common.flattenCategories(cat.children, level + 1)
        );
      }
    });

    return result;
  }
  
}

export default Common;
