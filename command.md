Task Objective
This task aims to help you showcase your working knowledge of React Native in the form of an application that allows you to view food menus and make orders through the application.
The requirements of the app are as follows:
1. Create an application that
a. Allows users to be able to register, login and update their profiles on the application.
b. Views food menus
c. View a food item
d. Add items to cart
e. View cart
f. Remove items from the cart
g. Clears the cart
h. Goes to checkout
i. Places an order
2. Registration
a. Users should be able to register on the application using at least one type of sign-in provider eg email and password
b. Contact details should be requested during the registration process, include
i. Name
ii. Surname
iii. Contact number
iv. Address
v. Card details (You can use fake cards for testing purposes)
c. Users not registered should not be able to make orders.
3. Logging in
a. Users should be able to login with at least [but not limited to] one sign-in provider, eg Email and Password
4. Profile
a. Users should be able to update the following details on their profiles:
i. Name
ii. Email
iii. Address
iv. Contact number
v. Card details
b. Only registered users should have access to the profile screen
c. Users profiles should be connected to the orders that they make, eg by collecting UID during order submissions, (name, surname, contact details can also be included with the submission)
5. Viewing food menus, Home Screen
a. All users should be able to browse the app for the foods that the restaurant offers.
b. The food should be divided according to food type eg Dessert, Beverages, Alcohols, Burgers, Mains, Starters (You will decide how deep the division is)
c. Users should be able to see the following details about food items:
i. Name
ii. Description (this can include the ingredients the item has)
iii. Price
iv. Image
d. There should be a button that navigates to the View Item Screen
6. Viewing food item details, View Item Screen
a. The details that were shown on the home screen should be shown here as well, including
i. Name
ii. Description (this can include the ingredients the item has)
iii. Price
iv. Image
b. Users should be able to add the item to the cart, they can customise their orders before placing the order to the cart using side options, extras. Example below
i. Any side options the item has eg pap, chips, salads. Users can select either two sides or one side to include with the order. Price is already included in the total item price for this option.
ii. Any drink options that the food item has, prices can either be included or be an add-on.
iii. Any extras they can add to the order, eg another side of chips, sauces, salads, drinks etc. Price for this item should be an add on, meaning selecting an item from this extras actually adds money to the already calculated total
iv. Any optional ingredients that you want to remove or add from or to the food item eg lettuces being an option when choosing a burger
v. A quantity option should be given to the user, to add multiples of the item with the same exact options
vi. The above are only an example that online restaurants tend to have to allow users as much freedom on the orders they make. You can switch up the options how you wish according to your food items and preferences. Just remember to give the user freedom on their order.
7. Viewing a cart
a. Users should be able to view the current items on the cart
b. Users should be able to edit the quantity of the items on the cart
c. Users should be able to remove a single item from the cart
d. Users should be able to navigate to a different page to edit the extras chosen for the chosen item
e. Users should be able to clear the whole cart
f. Users should be able to navigate to the Checkout screen, checking out should be limited to registered users only. A prompt to register/sign-in can be added on this screen for users who are not logged in.
8. Checking out
a. Users should be able to change the drop-off address to a different location from this screen. The one registered with can be used as a default address.
b. Users should be able to see the total of their order
c. Users should be able to select/change their card from this screen.
d. There should be a button that allows users to place an order
9. Placing an order
a. All the details about the order are added to the database to start processing the order.
b. You can use any payment API, SDK you wish to process the order. Most APIs have a development account for testing which is free to use.
10. Admin Dashboard:
a. Create a separate admin dashboard for admins to manage food items and restaurant details.
b. Analyse and represent data in charts for the admin.
c. Include features for adding and updating restaurant information, managing food items, and viewing order history.
Links:
1. React Native: https://reactnative.dev/docs/environment-setup
2. React Native Elements: https://reactnativeelements.com/
3. VCC Cards: https://www.vccgenerator.org/
4. Stripe: https://api.stripe.com/v1/customers
5. PayPal: https://developer.paypal.com/dashboard/
Instructions:
1. Create a React Native application that meets the above requirements
2. Make use of reusable React Native components wherever applicable.
3. You are allowed to use libraries in this project as long as they do not get in the way of you addressing the requirements of the app. Eg React Native Elements
4. Other APIs may be used in the project as long as the core functionality stated in the requirements have been covered and work accordingly. You are not limited to just the mentioned APIs in this document.
5. You are to submit in the form of links. Sending code files directly to my email or slack will not count as a submission.
Evaluation Criteria:
1. Adherence to the requirements outlined in the specification.
2. User interface design and visual appeal.
3. Reusability of React Native components
4. CRUD operations functionality for making viewing items and placing an order
5. Code quality, organization, and adherence to best practices.
6. Overall functionality and usefulness of the app.
7. Design and plan your restaurant application. Add the design link to your repo’s README

"C:\Users\karab\Downloads\Food Ordering App UI (1).jpg" from this image Please help me create a modern expo react native app, "npx create-expo-app@latest" i ran this command to create the file structure/configurations. Make sure to give me the file structure of the app. Make sure to also explain everything that has been done. Make sure that you write
 full code for the all the files that might be used in the app. Also give me a list of all the dependencies that are installed for the app. Please try making it such that it can resemble the picture that is given below.
 And now make sure that even the file structure it is in way such that it is understandable to the programmer. Make it in a a way such that it is clear to the programmer.Make sure that you use typescript and tsx files. Not js files. and finally give me step by step on configuring the project with firebase and running. the application is for south african users so it should use Rand currency.
