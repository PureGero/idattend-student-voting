document.querySelector('.error').innerHTML = '';

const loginForm = document.querySelector('.login');

let loginToken;

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
      loginToken = data.loginToken;
      showCandidates(data.candidates.shuffle());
    } else {
      throw data.error || data;
    }
  })
  .catch(error => {
    document.querySelector('.login button[type=submit]').innerHTML = 'Login';
    document.querySelector('.login .error').innerHTML = error.toString();
  });

  return false;
};

function showCandidates(candidates) {
  loginForm.remove();

  const voteInfo = document.createElement('h1');
  voteInfo.innerHTML = 'Vote 1 to 10, (1 is the highest, 10 is the lowest)';

  const voteSubInfo = document.createElement('p');
  voteSubInfo.innerHTML = 'You only give 10 people a vote';

  const voteError = document.createElement('p');
  voteError.className = 'error';

  const voteSubmitButton = document.createElement('button');
  voteSubmitButton.type = 'submit';
  voteSubmitButton.innerHTML = 'Submit';

  const voteForm = document.createElement('form');
  voteForm.className = 'candidates';
  voteForm.action = '#';
  voteForm.onsubmit = submitVoteForm;

  voteForm.appendChild(voteInfo);
  voteForm.appendChild(voteSubInfo);
  candidates.forEach(candidate => voteForm.appendChild(createCandidate(candidate.name, candidate.id)));
  voteForm.appendChild(voteError);
  voteForm.appendChild(voteSubmitButton);

  document.body.appendChild(voteForm);

  document.querySelectorAll('.candidate input').forEach(input => {
    input.onchange = voteValueChange;
    input.onkeydown = event => setTimeout(() => voteValueChange(event), 0);
  });
}

function showVoteSuccess() {
  document.querySelector('.candidates').remove();

  const success = document.createElement('h1');
  success.innerHTML = 'Vote submitted';

  document.body.appendChild(success);
}

function createCandidate(name, id) {
  const div = document.createElement('div');

  div.className = 'candidate';
  div.innerHTML = `
    <img src="photos/${id}.jpg"/>
    <label for="${name},${id}">${name}</label>
    <input type="number" id="${name},${id}" name="${name},${id}" placeholder="1"/>
    <span class="value_error"></span>
  `;

  return div;
}

function voteValueChange() {
  const map = {};
  document.querySelector('.candidates button[type=submit]').disabled = false;
  document.querySelectorAll('.candidate input').forEach(input => {
    let error = '';
    if (input.value) {
      const value = parseInt(input.value);
      if (isNaN(value) || value < 1 || value > 10) {
        error = 'Vote must be between<br/>1 and 10';
      } else if (value in map) {
        error = 'Duplicate vote';
      }
      map[value] = true;
    }
    input.parentElement.querySelector('.value_error').innerHTML = error;
    if (error) {
      document.querySelector('.candidates button[type=submit]').disabled = true;
    }
  });

  if (Object.keys(map).length) {
    document.querySelectorAll('.candidate input').forEach(input => input.placeholder = '');
  } else {
    document.querySelectorAll('.candidate input').forEach(input => input.placeholder = '1');
  }
}

function submitVoteForm(e) {
  e.preventDefault();
  
  document.querySelector('.candidates button[type=submit]').innerHTML = 'Submitting...';

  const votes = [];

  document.querySelectorAll('.candidate input').forEach(input => {
    if (input.value) {
      votes[10 - parseInt(input.value)] = input.id;
    }
  });

  fetch('submitVotes', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loginToken, votes }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showVoteSuccess();
    } else {
      throw data.error || data;
    }
  })
  .catch(error => {
    document.querySelector('.candidates button[type=submit]').innerHTML = 'Submit';
    document.querySelector('.candidates .error').innerHTML = error.toString();
  });

  return false;
}

Array.prototype.shuffle = function() {
  var currentIndex = this.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [this[currentIndex], this[randomIndex]] = [
      this[randomIndex], this[currentIndex]];
  }

  return this;
}