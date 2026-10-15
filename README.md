# ClubConnect

ClubConnect: Student Organization Hub is a mobile application designed to help with student
club management and acts as a hub where students can discover, join, and participate in school
clubs, while club leaders can manage clubs and track participation. In addition, school
administrators are able to manage all clubs, with new clubs having to be approved by the admin
first before being available for students to join.

The app was developed using Expo and React Native, while also using Expo Router to
implement file-based navigation. For styling, NativeWind was used, which is the React Native
version of Tailwind CSS. This allowed for the app to have a consistent design throughout the
app. Firebase was used as a complete backend solution, being used for both authentication and
database. However, Firebase was not used for cloud storage. Instead, the Cloudinary API was
used to store all club images and user avatars.

## Authentication
When the user first opens the app, they are met with the login screen, with the option to create a
new account if they haven’t already, or send a reset link to their email if they forgot their
password. There are 2 different roles that users may select while they are creating their account:
Student or Admin. For both roles, users must provide their email, name, password, and profile
picture. Across different app sessions, users remain logged in with persistent sessions, ensuring
users only have to log in once.

When a student first creates their account, they are prompted to join a school with the school
code. Students are unable to access any other part of the app until they join a school, at which
point they may browse available clubs to join or create their own club. The school code will need
to be given by the administrator.

Administrators are shown a screen to create a school once they create their account. The process
of creating a school includes providing the school name and school address. Once completed,
administrators will be navigated to the home screen, where the school code will have been
generated and displayed for them to share with students.

## Club Management
For a club to be visible to students browsing for clubs, the club leader will need to set the club as
public when creating it. For clubs that are set to private, a student will need to enter the club code
to join the club, similar to the way that they join their school. When viewing a club, students can
see club announcements, upcoming events (which show up in their calendar on the “Events” tab
if they are a member of that club), the members list, and if they have joined the club, they will be
able to track their participation by looking at how many of the 10 most recent club events they
have attended. Club leaders can create new announcements and events and remove students from
the club, and are also able to view the list of members who attended each event.

## Events and Announcements
Club leaders have the ability to schedule events, which appear in the calendar and list of
upcoming events for all members of the club. For a student to be counted for attendance in a club
event, they will need to check in. Check-in for all events opens 10 minutes before the event starts
and closes 30 minutes after, giving students a 40-minute window to obtain the code required to
check in and let club leaders know that they attended the event. Club leaders can also post
announcements, which go out to all members of the club.

## Adminstrators
Administrators are able to see all clubs that exist in the school and see the full details of each
club in the same way that the club leader can. When students create a club, the club first gets sent
to the admin to request approval, and once the administrator has looked over the club and
approved it, it will officially become a club of the school and can be joined by students. If the
club is denied, it will be removed from the database entirely. Until clubs are either approved or
denied, the club will remain in the list of pending club approvals for administrators. Admins also
see a list of all students in the school and can search for a specific student. They are then able to
tap on a particular student to view that student’s account information, including the clubs they
have joined and the ones that they created. Additionally, administrators have full access to all
information about the school, including the school code, the number of students, and the number
of clubs.

## Navigation Architecture
The app follows a role-based navigation system, with different routes for students and
administrators. The app utilizes tab navigation, and the bottom tabs are different for students ad
administrators. The tabs visible for students are as follows: Home, Clubs, Events, Profile. For
administrators, it is slightly different, with their tabs being: Home, Clubs, Students, Settings. The
profile screen for students and the settings screen for administrators are structured similarly, with
both screens allowing the user to edit their profile picture and view information about their
account. In addition, stack navigation is used to display detailed views within each tab.

## Responsive Design
The app has been fully optimized for mobile devices. There is intelligent keyboard handling for
text inputs to prevent the keyboard from covering the input. In addition, buttons are appropriately
sized for mobile screens, and screens are adjusted for different device sizes.

## Screenshots
<p align="center">
   <img alt="Home Screen" width="25%" src="https://github.com/user-attachments/assets/8f7b0a53-b7c0-4941-91d4-23f52855cb8a" />
   &nbsp;&nbsp;&nbsp;&nbsp;
   <img alt="Clubs Screen" width="25%"  src="https://github.com/user-attachments/assets/6268390d-831e-4f40-b07a-21b0818d871a" />
   &nbsp;&nbsp;&nbsp;&nbsp;
   <img alt="Events Screen" width="25%" src="https://github.com/user-attachments/assets/b926728d-de50-4d2d-a664-2b6909a98437" />
</p>
<p align="center">
   <img alt="Settings Screen" width="25%" src="https://github.com/user-attachments/assets/ad3bb896-0791-4666-9aed-0a04f9f2c386" />
   &nbsp;&nbsp;&nbsp;&nbsp;
   <img alt="Specific Club Screen" width="25%" src="https://github.com/user-attachments/assets/d7dbe244-b94d-41ff-b7d3-c3a9e098d7c3" />
   &nbsp;&nbsp;&nbsp;&nbsp;
   <img alt="Attendance Screen" width="25%" src="https://github.com/user-attachments/assets/ed35af88-b191-4e91-b3df-7714c2112fca" />
</p>
