const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readFile, writeFile } = require('../fileMethods');

const accounts = require('../data/accounts.json');

const ACCOUNTS_FILE = './server/data/accounts.json';
const JWT_SECRET = 'supersecretkey';

const register = async (req, res) => {
  const { username, password } = req.body;
  const accounts = readFile(ACCOUNTS_FILE);

  console.log(req.body);

  if (accounts.find((account) => account.username === username)) {
    return res.status(400).json({ error: 'Account already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  accounts.push({ username, password: hashedPassword });
  writeFile(ACCOUNTS_FILE, accounts);

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
  const { username } = req.params;
  if (!accounts.find((account) => account.username === username))
    res.status(400).json({ error: 'Account could not be deleted' });

  const updatedAccounts = readFile(ACCOUNTS_FILE).filter(
    (account) => account.username !== username,
  );
  writeFile(ACCOUNTS_FILE, updatedAccounts);

  res.json({ message: 'Account is deleted successfully.' });
};

module.exports = { register, login, deleteAccount };
