function showData() {
  let showName = document.getElementById('name').value;
  let showEmail = document.getElementById('email').value;
  let showPhone = document.getElementById('phone').value;
  let showSubject = document.getElementById('subject').value;
  let showMessage = document.getElementById('message').value;

  console.log(showPhone);
  console.log(showSubject);
  console.log(showMessage);

  if (showName == '') {
    return alert('Nama harus diisi');
  }
  if (showPhone == '') {
    return alert('Phone harus diisi');
  }
  if (showEmail == '') {
    return alert('Email harus diisi');
  }
  if (showSubject == '') {
    return alert('Subject harus diisi');
  }

  if (
    showName != '' &&
    showPhone != '' &&
    showEmail != '' &&
    showSubject != ''
  ) {
    let emailReceiver = 'rhomairama@gmail.com';

    let a = document.createElement('a');
    a.href = `mailto:${emailReceiver}?subject:${showSubject}&body= Hello, My name is ${showName}, ${showMessage}`;

    a.click();
  }
}
