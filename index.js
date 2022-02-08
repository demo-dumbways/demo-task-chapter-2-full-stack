require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');

const db = require('./connection/db');
const upload = require('./middlewares/uploadFile');

const app = express();
const PORT = process.env.PORT || 5000;

let isLogin = true; // boolean => true/false

const month = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

app.set('view engine', 'hbs'); // set tample engine

app.use('/public', express.static(__dirname + '/public')); // set public folder/path
app.use('/uploads', express.static(__dirname + '/uploads')); // set public folder/path
app.use(express.urlencoded({ extended: false }));

app.use(flash());

app.use(
  session({
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: 'secretValue',
  })
);

app.get('/', (req, res) => {
  let query = 'SELECT * from tb_project';
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      let data = result.rows;

      data = data.map(function (blog) {
        return {
          ...blog,
          duration: monthDuration(
            new Date(blog.end_date),
            new Date(blog.start_date)
          ),
          isLogin: req.session.isLogin ? true : false,
          image:
            blog.image == 'null'
              ? '/public/assets/my-img.png'
              : '/uploads/' + blog.image,
        };
      });

      res.render('index', {
        projects: data,
      });
    });
  });
});

app.get('/blog', function (req, res) {
  // Route for blog data

  let query = `SELECT blog.id, blog.title, blog.content, blog.image, tb_user.name AS author, blog.author_id, blog.post_at
                    FROM blog LEFT JOIN tb_user
                    ON blog.author_id = tb_user.id`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      let data = result.rows;

      data = data.map(function (blog) {
        return {
          ...blog,
          post_at: getFullTime(blog.post_at),
          post_age: getDistanceTime(blog.post_at),
          isLogin: req.session.isLogin ? true : false,
          image:
            blog.image == 'null'
              ? '/public/assets/blog-img.png'
              : '/uploads/' + blog.image,
        };
      });

      console.log(data);

      res.render('blog', {
        isLogin: req.session.isLogin,
        blogs: data,
        user: req.session.user,
      });
    });
  });
});

app.get('/project', function (req, res) {
  // Route for add-blog
  console.log({
    isLogin: req.session.isLogin ? true : false,
    user: req.session.user ? true : false,
  });
  res.render('add-project', {
    isLogin: req.session.isLogin ? true : false,
    user: req.session.user ? true : false,
  });
});

app.post('/project', upload.single('image'), function (req, res) {
  // Route for post blog
  let data = {
    name: req.body.name,
    desc: req.body.desc,
    start_date: req.body.start,
    end_date: req.body.end,
    image: req.file.filename,
  };

  let query = `INSERT INTO tb_project(name,start_date,end_date,description,image) VALUES ('${data.name}', '${data.start_date}', '${data.end_date}', '${data.desc}','${data.image}')`;
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      console.log(result);

      res.redirect('/');
    });
  });
});

app.get('/delete-project/:id', function (req, res) {
  let id = req.params.id;
  let query = `DELETE FROM tb_project WHERE id = ${id}`;

  db.connect(function (err, client, done) {
    if (err) throw err;
    client.query(query, function (err, result) {
      if (err) throw err;
      done();
      res.redirect('/');
    });
  });
});

app.get('/contact', function (req, res) {
  // Route for contact me
  res.render('contact');
});

app.get('/detail-project/:id', function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `SELECT * FROM tb_project WHERE tb_project.id = ${id}`,
      function (err, result) {
        if (err) throw err;
        let data = result.rows[0];
        done();

        data = {
          ...data,
          duration: monthDuration(
            new Date(data.end_date),
            new Date(data.start_date)
          ),
          isLogin: req.session.isLogin ? true : false,
          image:
            data.image == 'null'
              ? '/public/assets/my-img.png'
              : '/uploads/' + data.image,
        };

        console.log(data);

        res.render('project-detail', { project: data });
      }
    );
  });
});

app.get('/update-project/:id', function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `SELECT * FROM tb_project WHERE tb_project.id = ${id}`,
      function (err, result) {
        if (err) throw err;
        let data = result.rows[0];
        done();

        data = {
          ...data,
          duration: monthDuration(
            new Date(data.end_date),
            new Date(data.start_date)
          ),
          isLogin: req.session.isLogin ? true : false,
          image:
            data.image == 'null'
              ? '/public/assets/my-img.png'
              : '/uploads/' + data.image,
        };

        console.log(data);

        res.render('update-project', { project: data });
      }
    );
  });
});

app.post('/update-project', upload.single('image'), function (req, res) {
  // Route for post blog
  let data = req.body;
  let query;
  if (req.file) {
    query = `UPDATE tb_project
                SET name='${data.name}', start_date='${data.start}', end_date='${data.end}', description='${data.desc}', image='${req.file.filename}'
                WHERE tb_project.id = ${data.id};`;
  } else {
    query = `UPDATE tb_project
                SET name='${data.name}', start_date='${data.start}', end_date='${data.end}', description='${data.desc}'
                WHERE tb_project.id = ${data.id};`;
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      console.log(result);

      res.redirect('/');
    });
  });
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.post('/register', function (req, res) {
  const { email, name, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  let query = `INSERT INTO tb_user(name, email, password) VALUES('${name}', '${email}', '${hashedPassword}')`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      res.redirect('/login');
    });
  });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function (req, res) {
  const { email, password } = req.body;

  let query = `SELECT * FROM tb_user WHERE email = '${email}'`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;

      done();

      if (result.rows.length == 0) {
        req.flash('danger', "Email & Password don't match!");
        return res.redirect('/login');
      }

      let isMatch = bcrypt.compareSync(password, result.rows[0].password);

      if (isMatch) {
        req.session.isLogin = true;
        req.session.user = {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
        };

        req.flash('success', 'Login success');
        res.redirect('/');
      } else {
        req.flash('danger', "Email & Password don't match!");
        res.redirect('/login');
      }
    });
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT: ${PORT}`);
});

function getFullTime(time) {
  const date = time.getDate();
  const monthIndex = time.getMonth();
  const year = time.getFullYear();

  const hours = time.getHours();
  const minutes = time.getMinutes();

  return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`;
}

function getDistanceTime(time) {
  const distance = new Date() - new Date(time);

  // Convert to day
  const miliseconds = 1000;
  const secondsInMinute = 3600; //Second in 1 minute
  const hoursInDay = 23;
  const dayDistance = distance / (miliseconds * secondsInMinute * hoursInDay);

  if (dayDistance >= 1) {
    return Math.floor(dayDistance) + ' day ago';
  } else {
    // Convert to hour
    const hourDistance = Math.floor(distance / (1000 * 60 * 60));
    if (hourDistance > 0) {
      return hourDistance + ' hour ago';
    } else {
      // Convert to minute
      const minuteDistance = Math.floor(distance / (1000 * 60));
      return minuteDistance + ' minute ago';
    }
  }
}

function monthDuration(endDate, startDate) {
  let month;
  let year;
  let monthDistance;
  let endMonth = endDate.getMonth();
  let startMonth = startDate.getMonth();
  let endYear = endDate.getFullYear();
  let startYear = startDate.getFullYear();

  if (startYear == endYear) {
    if (startMonth == endMonth) {
      month = 1;
      return 'durasi ' + month + ' bulan';
    } else {
      month = endMonth - startMonth;
      return 'durasi ' + month + ' bulan';
    }
  }

  if (endYear > startYear) {
    if (endYear - startYear == 1) {
      if (startMonth == endMonth) {
        return 'durasi 1 tahun';
      } else if (startMonth > endMonth) {
        month = (startMonth - endMonth - 12) * -1;
        return 'durasi ' + month + ' bulan';
      } else if (startMonth < endMonth) {
        month = endMonth - startMonth;
        return 'durasi 1 tahun ' + month + ' bulan';
      }
    } else {
      year = endYear - startYear;
      if (startMonth == endMonth) {
        return 'durasi ' + year + ' tahun ';
      } else if (startMonth > endMonth) {
        year -= 1;
        month = (startMonth - endMonth - 12) * -1;
        return 'durasi ' + year + ' tahun ' + month + ' bulan';
      } else if (startMonth < endMonth) {
        month = endMonth - startMonth;
        return 'durasi ' + year + ' tahun ' + month + ' bulan';
      }
    }
  }
}
