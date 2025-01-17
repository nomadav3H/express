import express from 'express';
import session from 'express-session';
import { Low, JSONFile } from 'lowdb';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3000;
const JWT_SECRET = 'hkjhkjhkjgtdrseerrr'; // Replace with your secret


// Set up LowDB
const adapter = new JSONFile('db/users.json');
const db = new Low(adapter);

/**
 * Initialize the database.
 * Reads the data from the JSON file and sets default data if necessary.
 *
 * @async
 * @function
 * @returns {Promise<void>}
 */
(async () => {
  await db.read();
  db.data = db.data || { posts: [] };
  await db.write();
})();

// Middleware to parse JSON
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(express.json());  


/**
 * Middleware to authenticate JWT tokens.
 * Verifies the token and attaches user info to the request object.
 *
 * @name authenticateToken
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Next middleware function.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Web Routes

/**
 * Route to the home page.
 * Redirects to dashboard if logged in, otherwise to login page.
 *
 * @name get/
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get('/', (req, res) => {
  if (req.session.loggedin) {
    res.redirect(`/dashboard/`);
  } else {
    res.redirect(`/login`);
  }
});

/**
 * Route to the login page.
 * Redirects to dashboard if already logged in, otherwise renders login page.
 *
 * @name get/login
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get('/login', (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/dashboard');
  } else {
    res.render('login');
  }
});

/**
 * Post route for logging in.
 * Authenticates user and sets session.
 *
 * @route POST /login
 * @param {Object} req - Express request object containing `username` and `password`.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    await db.read();
    const user = db.data.users.find(user => user.email === username && user.password === password);

    if (user) {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect(`/dashboard/`);
    } else {
      res.redirect('/');
    }
  } else {
    res.redirect('/login');
  }
});

/**
 * Route to the dashboard.
 * Renders dashboard if logged in, otherwise redirects to login page.
 *
 * @name get/dashboard
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
app.get('/dashboard/', async (req, res) => {
  await db.read();
  const user = db.data.users.find(user => user.email === req.session.username);

  if (req.session.loggedin) {
    res.render('dashboard', { user });
  } else {
    res.redirect(`/login`);
  }
});

/**
 * Route for inactive users.
 * Renders a page to inform users their account is inactive.
 *
 * @route GET /inactive
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.get('/inactive', (req, res) => {
  res.render('inactive'); // Create an 'inactive.ejs' view to inform users about their inactive status
});

/**
 * Route for updating user details.
 * Updates user details in the database and redirects to dashboard.
 *
 * @name post/update
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
app.post('/update', async (req, res) => {
  const { email, picture, age, eyeColor, firstName, lastName, company, phone, address } = req.body;
  await db.read();
  const user = db.data.users.find(user => user.email === email);

  if (user) {
    user.picture = picture !== undefined ? picture : user.picture;
    user.age = age !== undefined ? age : user.age;
    user.eyeColor = eyeColor !== undefined ? eyeColor : user.eyeColor;
    user.name.first = firstName !== undefined ? firstName : user.name.first;
    user.name.last = lastName !== undefined ? lastName : user.name.last;
    user.company = company !== undefined ? company : user.company;
    user.phone = phone !== undefined ? phone : user.phone;
    user.address = address !== undefined ? address : user.address;

    await db.write();

    res.redirect(`/dashboard/`);
  } else {
    res.redirect('/');
  }
});

/**
 * Route to log out.
 * Destroys the session and redirects to login page.
 *
 * @name get/logout
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// API Routes

/**
 * API route for logging in.
 * Authenticates user and issues JWT token.
 *
 * @route POST /api/login
 * @param {Object} req - Express request object containing `username` and `password`.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username && password) {  
    await db.read();
    const user = db.data.users.find(user => user.email === username && user.password === password);
    if (user) {
      const accessToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } else {
    res.status(400).send('Username and password required');
  }
});

/**
 * API route to get user dashboard information.
 * Requires authentication via JWT.
 *
 * @route GET /api/dashboard
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  await db.read();
  const user = db.data.users.find(user => user.email === req.user.email);

  if (user) {
    res.json(user);
  } else {
    res.sendStatus(401);
  }
});

/**
 * API route for updating user details.
 * Requires authentication via JWT.
 *
 * @route POST /api/update
 * @param {Object} req - Express request object containing user details to update.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.post('/api/update', authenticateToken, async (req, res) => {
  const { email, picture, age, eyeColor, firstName, lastName, company, phone, address } = req.body;
  await db.read();
  const user = db.data.users.find(user => user.email === req.user.email);

  if (user) {
    user.picture = picture !== undefined ? picture : user.picture;
    user.age = age !== undefined ? age : user.age;
    user.eyeColor = eyeColor !== undefined ? eyeColor : user.eyeColor;
    user.name.first = firstName !== undefined ? firstName : user.name.first;
    user.name.last = lastName !== undefined ? lastName : user.name.last;
    user.company = company !== undefined ? company : user.company;
    user.phone = phone !== undefined ? phone : user.phone;
    user.address = address !== undefined ? address : user.address;

    await db.write();

    res.json(user);
  } else {
    res.sendStatus(401);
  }
});


// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app;
