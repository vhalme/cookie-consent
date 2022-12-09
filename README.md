# Development setup

- `npm install`
- `npm start` — This will spawn a development server with a default port of `5173`.

# Usage

Make the library visible to the page by importing the module in the head section:

```
<script type="module">
  import cookies from './cookies.js'
  window.cookies = cookies
</script>
```

Call cookie related functions from the `cookies` imported in the page head.

```
<script>
  cookies.consentToCookies()
</script>
```
```
<button onclick="cookies.consentToCookies()">ACCEPT COOKIES</button>
```

# API

**consentToCookies()**

1. Reads the user selections for allowed cookies from the cookie consent dialog
2. Creates a JSON structure from user selected values organized by category.
3. Encodes allowed cookies JSON to Base64 string and sets it as a consent cookie.
4. Initializes libraries that require cookies conditionally based on user selections saved in the consent cookie.

**loadCustobarScript(companyToken)**

1. Inserts Custobar library script into page head
2. Calls custobar 'start' function

**loadFBScript(fbId)**

1. Inserts Facebook Pixel library script into page head
2. Calls fbq 'init' and 'track' functions

**loadGTMScript(gtmId)**

Loads GTM initialization script

**loadScript(id)**

Loads any script present in the document head or body with the id attribute matching the function parameter and executes it.