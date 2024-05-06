const express = require('express');

const router = express.Router();

const users = [
  { id: '329710120d293', name: 'User 1', email: 'user01@gmail.com' },
  { id: '293c420923af3', name: 'User 2', email: 'user02@gmail.com' },
  { id: '83928afed2910', name: 'User 3', email: 'user03@gmail.com' },
];

const pageSize = 10;

router.get('/user', async (req, res) => {
  const pageNumber = parseInt(req.query.page_number) || 1;
  const sort = req.query.sort || 'email:asc';
  const [sortField, sortOrder] = sort.split(':');
  const search = req.query.search;

  let filteredUsers = users;

  if (search) {
    const [searchField, searchKey] = search.split(':');
    filteredUsers = users.filter((user) =>
      user[searchField].includes(searchKey)
    );
  }

  if (sortField && sortOrder) {
    filteredUsers.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortField].localeCompare(b[sortField]);
      } else {
        return b[sortField].localeCompare(a[sortField]);
      }
    });
  }

  const pageCount = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageUsers = filteredUsers.slice(startIndex, endIndex);
  const previousPage = pageNumber > 1;
  const nextPage = pageNumber < pageCount;

  res.json({
    page_number: pageNumber,
    page_size: pageSize,
    count: filteredUsers.length,
    total_pages: pageCount,
    has_previous_page: previousPage,
    has_next_page: nextPage,
    data: currentPageUsers,
  });
});

module.exports = router;
