document.getElementById('error').innerHTML = '';

const loginForm = document.querySelector('.login');

loginForm.onsubmit = e => {
  e.preventDefault();
  
  loginForm.remove();

  const voteForm = document.createElement('form');
  voteForm.className = 'candidates';
  voteForm.action = '#';
  [...new Array(14)].forEach(() => voteForm.appendChild(createCandidate('Geoff Smith', '123456789A')));
  // TODO Submit button
  document.body.appendChild(voteForm);

  document.querySelectorAll('.candidate input').forEach(input => {
    input.onchange = voteValueChange;
    input.onkeydown = event => setTimeout(() => voteValueChange(event), 0);
  });

  return false;
};

function createCandidate(name, id) {
  const div = document.createElement('div');

  div.className = 'candidate';
  div.innerHTML = `
    <img src="https://thispersondoesnotexist.com/image"/>
    <label for="${name},${id}">${name}</label>
    <input type="number" id="${name},${id}" name="${name},${id}" placeholder="☐"/>
  `;

  return div;
}

function voteValueChange() {
  const map = {};
  document.querySelectorAll('.candidate input').forEach(input => {
    if (input.value) {
      const value = parseInt(input.value);
      let error;
      if (isNaN(value) || value < 1 || value > 10) {
        error = 'Must be between 1 and 10';
      } else if (value in map) {
        error = 'Duplicate value';
      }
      map[value] = true;
    }
  });

  if (Object.keys(map).length) {
    document.querySelectorAll('.candidate input').forEach(input => input.placeholder = '');
  } else {
    document.querySelectorAll('.candidate input').forEach(input => input.placeholder = '☐');
  }
}