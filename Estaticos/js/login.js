 // JavaScript para el slider
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const totalSlides = slides.length;

    function showSlide(index) {
      // Ocultar todas las slides
      slides.forEach(slide => slide.classList.remove('active'));
      indicators.forEach(indicator => indicator.classList.remove('active'));
      
      // Mostrar la slide actual
      slides[index].classList.add('active');
      indicators[index].classList.add('active');
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }

    // Auto-slide cada 4 segundos
    setInterval(nextSlide, 4000);

    // Navegación manual por indicadores
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    }); 