// Get the past projects section
const pastProjectsSection = document.getElementById("past-projects");

// Get all project elements
const projectElements = pastProjectsSection.getElementsByClassName("project");

// Calculate the total width of all project elements
let projectsWidth = 0;
for (let i = 0; i < projectElements.length; i++) {
  projectsWidth += projectElements[i].offsetWidth;
}

// Create a wrapper element for the projects and set its width
const projectsWrapper = document.createElement("div");
projectsWrapper.style.width = projectsWidth + "px";
projectsWrapper.style.whiteSpace = "nowrap"; // Keep projects in a single row

// Append the projects to the wrapper
while (projectElements.length) {
  projectsWrapper.appendChild(projectElements[0]);
}

// Append the wrapper to the past projects section
pastProjectsSection.appendChild(projectsWrapper);

// Define the animation variables
let animationInterval;
let isPaused = false;

// Define the animation function
function animateProjects() {
  if (!isPaused) {
    const wrapperScrollLeft = pastProjectsSection.scrollLeft;

    if (wrapperScrollLeft >= projectsWidth) {
      // Reset scroll position to the beginning
      pastProjectsSection.scrollTo(0, 0);
    } else {
      // Scroll to the next position
      pastProjectsSection.scrollTo(wrapperScrollLeft + 1, 0);
    }
  }
}

// Set the animation interval
animationInterval = setInterval(animateProjects, 20);

// Pause animation when hovering over a project box
pastProjectsSection.addEventListener("mouseover", function () {
  isPaused = true;
});

// Resume animation when moving the mouse out of a project box
pastProjectsSection.addEventListener("mouseout", function () {
  isPaused = false;
});
