document.getElementById('quizForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const answers = ['q1', 'q2', 'q3'].map(q => {
      const selected = document.querySelector(`input[name="${q}"]:checked`);
      return selected ? selected.value : null;
    });
  
    if (answers.includes(null)) {
      alert('Please answer all questions!');
      return;
    }
  
    const genreString = [...new Set(answers)].join(',');
    window.location.href = `browseCatalog.html?genres=${genreString}`;
  });
  