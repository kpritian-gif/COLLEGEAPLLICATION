# KPRIT College Admission Portal

A complete college admission portal: multi-page website, full application form matching your Excel structure, and an efficient admin dashboard with search, filter, sort, and export.

## Features

- **Multi-page site**: Home, Apply, Programs, About, Contact with consistent navigation.
- **Full application form** (Apply page): Personal (name, DOB, gender, email, phone, nationality, blood group), Academic (10th/12th scores, rank, course, mode), Address (address, street, city, state, pincode, zip), Guardian (name, phone, occupation), Department & Year. All fields match the Excel columns (e.g. `departme`, `occupatio`, `course`, `guardian`, `guardianP`, etc.).
- **Real-time validation**: Email, phone, guardian phone, and 10th/12th scores validated as you type.
- **Admin dashboard**: Stats (total and by course), load on open, search (name/email/phone), filter by course and department, sort by any column, Export CSV.
- **Study-themed UI**: Hero images, feature cards, and clear layout across all pages.

## Setup

1. `npm install`
2. `npm start`
3. Open [http://localhost:3000](http://localhost:3000) — Home  
   Apply: [http://localhost:3000/apply.html](http://localhost:3000/apply.html)  
   Admin: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

## Project Structure

```
college admission/
├── server.js
├── applications.xlsx
├── public/
│   ├── index.html      # Home
│   ├── apply.html      # Full admission form
│   ├── programs.html   # Programs list
│   ├── about.html      # About
│   ├── contact.html    # Contact
│   ├── admin.html      # Admin dashboard
│   ├── admin.js        # Admin: load, search, filter, sort, export
│   ├── success.html
│   ├── style.css
│   └── script.js       # Form validation & submit
└── package.json
```

## License

ISC (student project).
