document.addEventListener("DOMContentLoaded", function () {
  // Predefine the reveals variable and initialize it with the elements
  var reveals = document.querySelectorAll(".reveal");

  function reveal() {
    var windowHeight = window.innerHeight;

    for (var i = 0; i < reveals.length; i++) {
      var elementTop = reveals[i].getBoundingClientRect().top;
      var elementVisible = 0;

      if (elementTop < windowHeight - elementVisible) {
        reveals[i].classList.add("active");
      } else {
        reveals[i].classList.remove("active");
      }
    }
  }

  window.addEventListener("scroll", reveal);
});
