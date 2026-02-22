// Real-time validation only (form submit handled in app.js for SPA)
document.addEventListener("input", function(e) {
  var name = e.target.name, val = e.target.value;
  if (name === "phone" || name === "guardianP") {
    var digits = val.replace(/\D/g, "");
    if (name === "phone") e.target.value = digits.slice(0, 10);
    if (name === "guardianP") e.target.value = digits.slice(0, 10);
    var valid = digits.length === 10;
    e.target.classList.toggle("valid", valid && digits.length > 0);
    e.target.classList.toggle("invalid", digits.length > 0 && !valid);
  }
  if (name === "email" || name === "guardianEmail") {
    if (!val.length) { e.target.classList.remove("valid", "invalid"); return; }
    var valid = /\S+@\S+\.\S+/.test(val);
    e.target.classList.toggle("valid", valid);
    e.target.classList.toggle("invalid", !valid);
  }
  if (name === "tenth" || name === "twelfth") {
    var num = parseFloat(val);
    var valid = !isNaN(num) && num >= 0 && num <= 100 && val.length > 0;
    e.target.classList.toggle("valid", valid);
    e.target.classList.toggle("invalid", val.length > 0 && !valid);
  }
});
