document.querySelector('.error').innerHTML = '';

const loginForm = document.querySelector('.login');

loginForm.onsubmit = e => {
  e.preventDefault();
  
  document.querySelector('.login button[type=submit]').innerHTML = 'Logging in...';
  document.querySelector('.login .error').innerHTML = '';

  const username = loginForm.username.value;
  const password = loginForm.password.value;

  fetch('login', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.candidates) {
      showCandidates(data.candidates);
    } else {
      document.querySelector('.login button[type=submit]').innerHTML = 'Login';
      document.querySelector('.login .error').innerHTML = data.error;
    }
  })

  return false;
};

function showCandidates(candidates) {
  loginForm.remove();

  const voteInfo = document.createElement('h1');
  voteInfo.innerHTML = 'Vote 1 to 10, (1 is the best, 10 is the worst)';

  const voteSubInfo = document.createElement('p');
  voteSubInfo.innerHTML = 'You only give 10 people a vote';

  const voteSubmitButton = document.createElement('button');
  voteSubmitButton.type = 'submit';
  voteSubmitButton.innerHTML = 'Submit';

  const voteForm = document.createElement('form');
  voteForm.className = 'candidates';
  voteForm.action = '#';

  voteForm.appendChild(voteInfo);
  voteForm.appendChild(voteSubInfo);
  voteForm.appendChild(voteSubmitButton);
  candidates.forEach(candidate => voteForm.appendChild(createCandidate(candidate.name, candidate.id)));
  voteForm.appendChild(voteSubmitButton);

  document.body.appendChild(voteForm);

  document.querySelectorAll('.candidate input').forEach(input => {
    input.onchange = voteValueChange;
    input.onkeydown = event => setTimeout(() => voteValueChange(event), 0);
  });
}

function createCandidate(name, id) {
  const div = document.createElement('div');

  div.className = 'candidate';
  div.innerHTML = `
    <img src="images/${id}.jpg"/>
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