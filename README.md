API Routes Documentation

**1.** **GET /global-posts**<br>
Description:<br>
Fetches all projects that are marked as global posts (isGlobalPost: true).
Returns project details with the user’s name and avatar populated.

**2. GET /users**<br>
Description:<br>
Retrieves details of all registered users.
Passwords are excluded from the response.

**3. GET /user**<br>
Auth:  JWT Protected<br>
Description:<br>
Gets the logged-in user's profile details (basic info).
Requires valid JWT for authentication.

**4. GET /user/full**<br>
Auth: JWT Protected<br>
Description:<br>
Retrieves logged-in user's full profile details along with all their projects.
Requires valid JWT.


**5. GET /project/:id**<br>
Auth: JWT Protected<br>
Description:<br>
Fetches a particular project by its ID with user details (name and avatar).
Access restricted to the owner of the project only.

**6. GET /suggest?q=searchTerm**<br>
Description:<br>
Provides search suggestions for users based on a query string matching either user name or skills.
Returns max 5 users with name, avatar, and _id.

**7. POST /profile**<br>
Auth: JWT Protected<br>
Description:<br>
Creates or updates the logged-in user's profile details, including optional avatar upload.
Uses multipart/form-data for file upload.

**8. POST /project**<br>
Auth: JWT Protected<br>
Description:<br>
Creates a new project for the logged-in user, accepts multiple image uploads (max 5).
Accepts project details like title, description, tech stack, project link, and global post flag.


**9. POST /project/:id/like**<br>
Auth: JWT Protected<br>
Description:<br>
Toggles like/unlike on a project by the logged-in user.
Returns the updated count of likes.
