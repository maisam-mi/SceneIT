const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readFile, writeFile } = require('../fileMethods');

const accounts = require('../data/accounts.json');

const ACCOUNTS_FILE = './server/data/accounts.json';
const FAVOURITES_FILE = './server/data/favourites.json';
const JWT_SECRET = 'supersecretkey';

const register = async (req, res) => {
  const { username, password } = req.body;
  const accounts = readFile(ACCOUNTS_FILE);

  console.log(req.body);

  if (accounts.find((account) => account.username === username)) {
    return res.status(400).json({ error: 'Account already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const account = {
    username,
    password: hashedPassword,
    quizResult: {
      type: "",
      genres: [],
      keywords: []
    }
  }
  accounts.push(account);
  writeFile(ACCOUNTS_FILE, accounts);

  // an favourite object is also added in favourites.json for this account. 
  const favourites = readFile(FAVOURITES_FILE);
  favourites.push({
    username,
    movies: [],
    tvseries: []
  });
  writeFile(FAVOURITES_FILE, favourites);

  console.log('Registration was successfull!');

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token, message: 'Account registered successfully' });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const accounts = readFile(ACCOUNTS_FILE);

  const account = accounts.find((account) => account.username === username);
  if (!account || !(await bcrypt.compare(password, account.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

const deleteAccount = async (req, res) => {
  const { username } = req.account;
  if (!accounts.find((account) => account.username === username))
    res.status(400).json({ error: 'Account could not be deleted' });

  const updatedAccounts = readFile(ACCOUNTS_FILE).filter(
    (account) => account.username !== username
  );
  writeFile(ACCOUNTS_FILE, updatedAccounts);

  // The favourite object for this account gets also deleted. 
  const updatedFavourites = readFile(FAVOURITES_FILE).filter(
    (favourite) => favourite.username !== username
  );
  writeFile(FAVOURITES_FILE, updatedFavourites);

  res.json({ message: 'Account is deleted successfully.' });
};

const changePassword = async (req, res) => {
  console.log(req.body);
  const { oldPassword, newPassword } = req.body;
  
  const username = req.account.username;

  const accounts = readFile(ACCOUNTS_FILE);
  const account = accounts.find(acc => acc.username === username);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const isMatch = await bcrypt.compare(oldPassword, account.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Old password is incorrect' });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  account.password = hashedNewPassword;

  writeFile(ACCOUNTS_FILE, accounts);

  res.json({ message: 'Password updated successfully' });
};

module.exports = { register, login, deleteAccount, changePassword };
