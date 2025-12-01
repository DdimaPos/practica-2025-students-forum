#!/usr/bin/env bun
import db from '@/db/index';
import {
  users,
  faculties,
  specialities,
  userSpecialities,
  courses,
  professors,
  courseProfessors,
  channels,
  posts,
  comments,
  postReactions,
  commentReactions,
  professorReviews,
  studentRatings,
  notifications,
  userFollowers,
  pollOptions,
  pollVotes,
} from '@/db/schema';

import { createServerClient } from '@supabase/ssr';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
export async function createMockClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookies) {
          console.log('mock cookies set:', cookies.length);

          return;
        },
      },
    }
  );
}

async function truncateAllTables() {
  console.log('cleaning up the mess...');

  // order matters - delete children before parents
  await db.delete(pollVotes);
  await db.delete(pollOptions);
  await db.delete(commentReactions);
  await db.delete(postReactions);
  await db.delete(comments);
  await db.delete(posts);
  await db.delete(channels);
  await db.delete(professorReviews);
  await db.delete(courseProfessors);
  await db.delete(professors);
  await db.delete(courses);
  await db.delete(studentRatings);
  await db.delete(notifications);
  await db.delete(userFollowers);
  await db.delete(userSpecialities);
  await db.delete(specialities);
  await db.delete(faculties);
  await db.delete(users);

  console.log('tables are squeaky clean!');
}

async function createAuthUsers() {
  console.log('creating auth users...');

  const supabase = await createMockClient();
  const authUsers = [];

  const userData = [
    {
      email: 'ana.popescu@student.utm.md',
      password: 'password123',
      firstName: 'Ana',
      lastName: 'Popescu',
    },
    {
      email: 'dmitri.ionescu@student.utm.md',
      password: 'password123',
      firstName: 'Dmitri',
      lastName: 'Ionescu',
    },
    {
      email: 'maria.smith@prof.utm.md',
      password: 'password123',
      firstName: 'Maria',
      lastName: 'Smith',
    },
    {
      email: 'alex.tech@student.utm.md',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Technoblade',
    },
  ];

  try {
    for (const user of userData) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (error) {
        throw new Error(`[SUPABASE] ${user.email}: ${error.message}`);
      }

      authUsers.push({
        authId: data.user.id,
        ...user,
      });
    }
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    console.log('assuming auth users already exist');
    for (const user of userData) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (error) {
        console.error(`failed to sign in auth user ${user.email}:`, error);
        throw error;
      }
      authUsers.push({
        authId: data.user.id,
        ...user,
      });
    }
  }

  console.log(`created ${authUsers.length} auth users`);

  return authUsers;
}

async function seedDatabase() {
  console.log('time to plant some data seeds...');

  try {
    // step 1: create auth users
    const authUsers = await createAuthUsers();

    // step 2: create faculties
    console.log('creating faculties...');
    const facultiesData = await db
      .insert(faculties)
      .values([
        {
          name: 'Facultatea de Calculatoare, Informatică și Microelectronică',
          description:
            'Faculty focusing on computer science, informatics, and microelectronics',
          deanName: 'Prof. Dr. Valeriu Ungureanu',
          establishedYear: 1964,
        },
        {
          name: 'Facultatea de Electronică și Telecomunicații',
          description: 'Electronics and telecommunications engineering',
          deanName: 'Prof. Dr. Ion Rusu',
          establishedYear: 1970,
        },
        {
          name: 'Facultatea de Energetică și Inginerie Electrică',
          description: 'Power engineering and electrical engineering',
          deanName: 'Prof. Dr. Elena Moraru',
          establishedYear: 1968,
        },
      ])
      .returning();

    // step 3: create specialities
    console.log('creating specialities...');
    const specialitiesData = await db
      .insert(specialities)
      .values([
        {
          facultyId: facultiesData[0].id,
          name: 'Informatica',
          description: 'Computer Science and Software Engineering',
          durationYears: 4,
          degreeType: 'bachelor',
        },
        {
          facultyId: facultiesData[0].id,
          name: 'Ingineria Sistemelor Software',
          description: 'Software Systems Engineering',
          durationYears: 4,
          degreeType: 'bachelor',
        },
        {
          facultyId: facultiesData[1].id,
          name: 'Telecomunicații',
          description: 'Telecommunications Engineering',
          durationYears: 4,
          degreeType: 'bachelor',
        },
        {
          facultyId: facultiesData[0].id,
          name: 'Inteligența Artificială',
          description: 'Artificial Intelligence and Machine Learning',
          durationYears: 2,
          degreeType: 'master',
        },
      ])
      .returning();

    // step 4: create users
    console.log('creating users...');
    const usersData = await db
      .insert(users)
      .values([
        {
          authId: authUsers[0].authId,
          firstName: authUsers[0].firstName,
          lastName: authUsers[0].lastName,
          email: authUsers[0].email,
          userType: 'student',
          bio: 'cs student who lives on coffee and memes',
          yearOfStudy: 3,
          isVerified: true,
        },
        {
          authId: authUsers[1].authId,
          firstName: authUsers[1].firstName,
          lastName: authUsers[1].lastName,
          email: authUsers[1].email,
          userType: 'student',
          bio: 'debugging life one semicolon at a time',
          yearOfStudy: 2,
          isVerified: true,
        },
        {
          authId: authUsers[2].authId,
          firstName: authUsers[2].firstName,
          lastName: authUsers[2].lastName,
          email: authUsers[2].email,
          userType: 'verified',
          bio: 'teaching assistant | algorithms enthusiast | here to help',
          isVerified: true,
        },
        {
          authId: authUsers[3].authId,
          firstName: authUsers[3].firstName,
          lastName: authUsers[3].lastName,
          email: authUsers[3].email,
          userType: 'student',
          bio: 'tech enthusiast | hackathon survivor | pizza connoisseur',
          yearOfStudy: 1,
          isVerified: true,
        },
      ])
      .returning();

    // step 5: link users to specialities
    console.log('linking users to specialities...');
    await db.insert(userSpecialities).values([
      {
        userId: usersData[0].id, // ana
        specialityId: specialitiesData[0].id, // informatica
        enrollmentDate: '2022-09-01',
        isCurrent: true,
      },
      {
        userId: usersData[1].id, // dmitri
        specialityId: specialitiesData[1].id, // software engineering
        enrollmentDate: '2023-09-01',
        isCurrent: true,
      },
      {
        userId: usersData[3].id, // alex
        specialityId: specialitiesData[0].id, // informatica
        enrollmentDate: '2024-09-01',
        isCurrent: true,
      },
    ]);

    // step 6: create courses
    console.log('creating courses...');
    const coursesData = await db
      .insert(courses)
      .values([
        {
          name: 'Algoritmi și Structuri de Date',
          code: 'ASD101',
          description: 'fundamental algorithms and data structures',
          credits: 6,
          facultyId: facultiesData[0].id,
          semester: 3,
        },
        {
          name: 'Programarea Orientată pe Obiecte',
          code: 'POO201',
          description: 'object-oriented programming principles',
          credits: 5,
          facultyId: facultiesData[0].id,
          semester: 4,
        },
        {
          name: 'Bazele Inteligenței Artificiale',
          code: 'AI301',
          description: 'introduction to AI and machine learning',
          credits: 4,
          facultyId: facultiesData[0].id,
          semester: 6,
        },
        {
          name: 'Dezvoltarea Aplicațiilor Web',
          code: 'WEB401',
          description: 'modern web development frameworks',
          credits: 5,
          facultyId: facultiesData[0].id,
          semester: 7,
        },
      ])
      .returning();

    // step 7: create professors (external entities, not platform users)
    console.log('creating professors...');
    const professorsData = await db
      .insert(professors)
      .values([
        {
          firstName: 'Elena',
          lastName: 'Popescu',
          email: 'elena.popescu@utm.md',
          department: 'Computer Science',
          title: 'Professor',
          facultyId: facultiesData[0].id,
        },
        {
          firstName: 'Ion',
          lastName: 'Rusu',
          email: 'ion.rusu@utm.md',
          department: 'Software Engineering',
          title: 'Associate Professor',
          facultyId: facultiesData[0].id,
        },
        {
          firstName: 'Natalia',
          lastName: 'Cojocaru',
          email: 'natalia.cojocaru@utm.md',
          department: 'Computer Science',
          title: 'Lecturer',
          facultyId: facultiesData[0].id,
        },
      ])
      .returning();

    // step 8: assign professors to courses
    console.log('assigning professors to courses...');
    const courseProfessorsData = await db
      .insert(courseProfessors)
      .values([
        {
          courseId: coursesData[0].id,
          professorId: professorsData[0].id, // elena - algorithms
          academicYear: '24/25',
          isPrimary: true,
        },
        {
          courseId: coursesData[1].id,
          professorId: professorsData[1].id, // ion - oop
          academicYear: '24/25',
          isPrimary: true,
        },
        {
          courseId: coursesData[2].id,
          professorId: professorsData[2].id, // natalia - web dev
          academicYear: '24/25',
          isPrimary: true,
        },
      ])
      .returning();

    // step 9: create channels
    console.log('creating channels...');
    const channelsData = await db
      .insert(channels)
      .values([
        {
          name: 'general-chat',
          description: 'random discussions and memes',
          channelType: 'general',
          createdBy: usersData[0].id,
        },
        {
          name: 'cs-students',
          description: 'computer science students unite!',
          channelType: 'academic',
          facultyId: facultiesData[0].id,
          createdBy: usersData[1].id,
        },
        {
          name: 'study-groups',
          description: 'find your study buddies here',
          channelType: 'academic',
          createdBy: usersData[2].id,
        },
        {
          name: 'campus-events',
          description: 'whats happening on campus',
          channelType: 'announcements',
          createdBy: usersData[2].id,
        },
        {
          name: 'chisinau-local',
          description: 'local chisinau student life',
          channelType: 'local',
          createdBy: usersData[0].id,
        },
      ])
      .returning();

    // step 10: create posts (5 per user = 20 total)
    console.log('creating posts...');
    const postsData = [];

    // ana's posts
    const anaPosts = await db
      .insert(posts)
      .values([
        {
          title: 'anyone else struggling with pointers?',
          content:
            'seriously, why do pointers have to be so confusing spent 3 hours debugging a segfault just to realize i forgot to malloc',
          postType: 'basic',
          authorId: usersData[0].id,
          channelId: channelsData[1].id, // cs-students
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'best coffee spots near utm?',
          content:
            'need my caffeine fix between classes. any recommendations for good coffee that wont break my student budget?',
          postType: 'basic',
          authorId: usersData[0].id,
          channelId: channelsData[4].id, // chisinau-local
          isAnonymous: false,
          locationLat: '47.0228',
          locationLng: '28.8353', // chisinau coordinates
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'study group for algorithms exam',
          content:
            'forming a study group for the algorithms final. dm me if interested! we can meet at the library',
          postType: 'basic',
          authorId: usersData[0].id,
          channelId: channelsData[2].id, // study-groups
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'when your code works but you dont know why',
          content:
            'that feeling when your algorithm passes all test cases but you have no idea how',
          postType: 'poll',
          authorId: usersData[0].id,
          channelId: channelsData[0].id, // general
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'hackathon this weekend!',
          content:
            'utm hosting a 48h hackathon this saturday. theme is "tech for good". who else is joining?',
          postType: 'event',
          authorId: usersData[0].id,
          channelId: channelsData[3].id, // events
          isAnonymous: false,
          locationLat: '47.0041',
          locationLng: '28.8097', // utm coordinates
          eventDate: new Date('2025-09-20T10:00:00Z'),
          eventLocation: 'UTM Campus, Building 1',
          isActive: true,
        },
      ])
      .returning();
    postsData.push(...anaPosts);

    // dmitri's posts
    const dmitriPosts = await db
      .insert(posts)
      .values([
        {
          title: 'react vs vue: fight me',
          content:
            'okay but seriously, vue is just better. cleaner syntax, easier learning curve, and the ecosystem is solid. change my mind',
          postType: 'basic',
          authorId: usersData[1].id,
          channelId: channelsData[0].id, // general
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'midnight coding session vibes',
          content:
            'currently 3am, fueled by energy drinks and determination. this assignment will be finished if it kills me',
          postType: 'basic',
          authorId: usersData[1].id,
          channelId: channelsData[1].id, // cs-students
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'looking for frontend internship',
          content:
            'anyone know companies in chisinau hiring frontend interns? i know react, vue, and can make things look pretty',
          postType: 'basic',
          authorId: usersData[1].id,
          channelId: channelsData[4].id, // chisinau-local
          isAnonymous: false,
          locationLat: '47.0228',
          locationLng: '28.8353',
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'git merge conflicts are evil',
          content:
            'spent 2 hours resolving merge conflicts only to realize i was on the wrong branch the whole time',
          postType: 'basic',
          authorId: usersData[1].id,
          channelId: channelsData[1].id, // cs-students
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'free pizza at the cs lab!',
          content:
            'professor brought pizza for everyone working late on projects. utm profs are the best',
          postType: 'basic',
          authorId: usersData[1].id,
          channelId: channelsData[0].id, // general
          isAnonymous: false,
          locationLat: '47.0041',
          locationLng: '28.8097',
          // eventDate: null,
          eventLocation: 'UTM CS Lab',
          isActive: true,
        },
      ])
      .returning();
    postsData.push(...dmitriPosts);

    // maria's posts
    const mariaPosts = await db
      .insert(posts)
      .values([
        {
          title: 'reminder: assignment deadline friday',
          content:
            'just a friendly reminder that the OOP assignment is due this friday at 23:59. no extensions unless you have a really good excuse (and no, netflix doesnt count)',
          postType: 'basic',
          authorId: usersData[2].id,
          channelId: channelsData[3].id, // events
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'office hours extended this week',
          content:
            'given that many students are struggling with the current material, ill be extending office hours monday and wednesday 14:00-17:00',
          postType: 'basic',
          authorId: usersData[2].id,
          channelId: channelsData[1].id, // cs-students
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'interesting ai research paper',
          content:
            'came across this fascinating paper on transformer architectures. highly recommend reading if youre interested in nlp: https://arxiv.org/abs/1706.03762',
          postType: 'basic',
          authorId: usersData[2].id,
          channelId: channelsData[1].id, // cs-students
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'congratulations to hackathon winners!',
          content:
            'amazing projects from this weekends hackathon. the level of creativity and technical skill was outstanding. proud of all participants!',
          postType: 'basic',
          authorId: usersData[2].id,
          channelId: channelsData[3].id, // events
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'guest lecture next week',
          content:
            'excited to announce a guest lecture from a google engineer next tuesday. topic: "scaling distributed systems". attendance is optional but highly recommended',
          postType: 'event',
          authorId: usersData[2].id,
          channelId: channelsData[3].id, // events
          isAnonymous: false,
          locationLat: '47.0041',
          locationLng: '28.8097',
          eventDate: new Date('2025-09-24T14:00:00Z'),
          eventLocation: 'UTM Campus, Amphitheater A1',
          isActive: true,
        },
      ])
      .returning();
    postsData.push(...mariaPosts);

    // alex's posts
    const alexPosts = await db
      .insert(posts)
      .values([
        {
          title: 'first year is overwhelming help',
          content:
            'everything is moving so fast and i feel like im drowning in assignments. any tips for surviving first year?',
          postType: 'basic',
          authorId: usersData[3].id,
          channelId: channelsData[0].id, // general
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'which programming language to learn first?',
          content:
            'currently learning c++ but wondering if i should focus on python instead. what do you guys think is more beginner-friendly?',
          postType: 'poll',
          authorId: usersData[3].id,
          channelId: channelsData[1].id, // cs-students
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'utm campus is huge!',
          content:
            'been here a month and still getting lost trying to find my classrooms. anyone else or is it just me being geographically challenged?',
          postType: 'basic',
          authorId: usersData[3].id,
          channelId: channelsData[0].id, // general
          isAnonymous: false,
          locationLat: '47.0041',
          locationLng: '28.8097',
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'made my first working program!',
          content:
            'just coded my first fibonacci calculator that actually works! its not much but im proud',
          postType: 'basic',
          authorId: usersData[3].id,
          channelId: channelsData[1].id, // cs-students
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
        {
          title: 'study buddy needed',
          content:
            'looking for someone to study with for the upcoming math exam. preferably someone patient with my questions',
          postType: 'basic',
          authorId: usersData[3].id,
          channelId: channelsData[2].id, // study-groups
          isAnonymous: false,
          // locationLat: null,
          // locationLng: null,
          // eventDate: null,
          // eventLocation: null,
          isActive: true,
        },
      ])
      .returning();
    postsData.push(...alexPosts);

    // step 11: create poll options for poll posts
    console.log('creating poll options...');
    const pollPosts = postsData.filter(p => p.postType === 'poll');

    for (const pollPost of pollPosts) {
      if (pollPost.title.includes('code works but you dont know why')) {
        await db.insert(pollOptions).values([
          {
            postId: pollPost.id,
            optionText: 'happens all the time',
            optionOrder: 1,
            voteCount: 12,
          },
          {
            postId: pollPost.id,
            optionText: 'never, i understand everything',
            optionOrder: 2,
            voteCount: 2,
          },
          {
            postId: pollPost.id,
            optionText: 'thats called magic',
            optionOrder: 3,
            voteCount: 8,
          },
        ]);
      }

      if (pollPost.title.includes('programming language to learn')) {
        await db.insert(pollOptions).values([
          {
            postId: pollPost.id,
            optionText: 'stick with c++',
            optionOrder: 1,
            voteCount: 5,
          },
          {
            postId: pollPost.id,
            optionText: 'switch to python',
            optionOrder: 2,
            voteCount: 15,
          },
          {
            postId: pollPost.id,
            optionText: 'try javascript instead',
            optionOrder: 3,
            voteCount: 7,
          },
          {
            postId: pollPost.id,
            optionText: 'learn all of them!',
            optionOrder: 4,
            voteCount: 3,
          },
        ]);
      }
    }

    // step 12: create comments
    console.log('creating comments...');
    const commentsData = await db
      .insert(comments)
      .values([
        // comments on ana's pointer post
        {
          postId: postsData[0].id,
          authorId: usersData[1].id, // dmitri
          content: 'pointers are evil but necessary. draw diagrams, it helps!',
        },
        {
          postId: postsData[0].id,
          authorId: usersData[2].id, // maria
          content:
            'come to my office hours, well go through pointer basics together',
        },
        {
          postId: postsData[0].id,
          authorId: usersData[3].id, // alex
          content: 'same here! thought i was the only one struggling',
        },
        // comments on dmitri's react vs vue post
        {
          postId: postsData[5].id,
          authorId: usersData[0].id, // ana
          content: 'react has better job market though',
        },
        {
          postId: postsData[5].id,
          authorId: usersData[2].id, // maria
          content:
            'both are excellent frameworks. focus on learning concepts, not syntax wars',
        },
        // comments on alex's first year post
        {
          postId: postsData[15].id,
          authorId: usersData[0].id, // ana
          content:
            'first year is tough but it gets better! make friends, form study groups',
        },
        {
          postId: postsData[15].id,
          authorId: usersData[1].id, // dmitri
          content: 'time management is key. use a calendar app religiously',
        },
        {
          postId: postsData[15].id,
          authorId: usersData[2].id, // maria
          content:
            'my door is always open if you need help. dont suffer in silence!',
        },
      ])
      .returning();

    // step 12: create reactions
    console.log('creating reactions...');
    await db.insert(postReactions).values([
      {
        userId: usersData[1].id,
        postId: postsData[0].id,
        reactionType: 'upvote',
      },
      {
        userId: usersData[2].id,
        postId: postsData[0].id,
        reactionType: 'upvote',
      },
      {
        userId: usersData[3].id,
        postId: postsData[0].id,
        reactionType: 'upvote',
      },
      {
        userId: usersData[0].id,
        postId: postsData[5].id,
        reactionType: 'downvote',
      }, // ana disagrees with vue
      {
        userId: usersData[2].id,
        postId: postsData[5].id,
        reactionType: 'upvote',
      },
      {
        userId: usersData[0].id,
        postId: postsData[15].id,
        reactionType: 'upvote',
      },
      {
        userId: usersData[1].id,
        postId: postsData[15].id,
        reactionType: 'upvote',
      },
      {
        userId: usersData[2].id,
        postId: postsData[19].id,
        reactionType: 'upvote',
      }, // alex's first program
    ]);

    await db.insert(commentReactions).values([
      {
        userId: usersData[0].id,
        commentId: commentsData[0].id,
        reactionType: 'upvote',
      },
      {
        userId: usersData[3].id,
        commentId: commentsData[1].id,
        reactionType: 'upvote',
      },
      {
        userId: usersData[2].id,
        commentId: commentsData[5].id,
        reactionType: 'upvote',
      },
    ]);

    // step 13: create professor reviews
    console.log('creating professor reviews...');
    await db.insert(professorReviews).values([
      {
        reviewerId: usersData[0].id, // ana
        courseProfessorsId: courseProfessorsData[0].id, // elena - algorithms
        overallRating: 5,
        teachingQuality: 5,
        communication: 4,
        helpfulness: 5,
        reviewText:
          'prof popescu is amazing! explains complex concepts clearly and is always willing to help',
        isAnonymous: false,
      },
      {
        reviewerId: usersData[1].id, // dmitri
        courseProfessorsId: courseProfessorsData[1].id, // ion - oop
        overallRating: 4,
        teachingQuality: 4,
        communication: 5,
        helpfulness: 4,
        reviewText:
          'great teacher, sometimes goes a bit fast but office hours are helpful',
        isAnonymous: true,
      },
    ]);

    // step 14: create student ratings
    console.log('creating student ratings...');
    await db.insert(studentRatings).values([
      {
        ratedStudentId: usersData[0].id, // ana
        raterId: usersData[1].id, // dmitri
        category: 'collaboration',
        rating: 5,
        comment: 'excellent study partner, very organized',
      },
      {
        ratedStudentId: usersData[1].id, // dmitri
        raterId: usersData[0].id, // ana
        category: 'academic_help',
        rating: 4,
        comment: 'knows a lot about web development, helpful with projects',
      },
    ]);

    // step 15: create schedules
    console.log('skipping schedules...');
    // await db.insert(userSchedules).values([
    //   {
    //     userId: usersData[0].id,
    //     title: 'algorithms class',
    //     description: 'weekly algorithms lecture',
    //     eventType: 'class',
    //     startDatetime: '2025-09-15T10:00:00Z',
    //     endDatetime: '2025-09-15T12:00:00Z',
    //     location: 'UTM, Room 201',
    //     courseId: coursesData[0].id,
    //     isRecurring: true,
    //     recurrencePattern: 'weekly',
    //   },
    //   {
    //     userId: usersData[1].id,
    //     title: 'web dev project deadline',
    //     description: 'final project submission',
    //     eventType: 'assignment',
    //     startDatetime: '2025-09-25T23:59:00Z',
    //     endDatetime: '2025-09-25T23:59:00Z',
    //     courseId: coursesData[3].id,
    //   },
    // ]);

    // step 16: create followers
    console.log('creating followers...');
    await db.insert(userFollowers).values([
      { followerId: usersData[0].id, followingId: usersData[1].id }, // ana follows dmitri
      { followerId: usersData[1].id, followingId: usersData[0].id }, // dmitri follows ana
      { followerId: usersData[3].id, followingId: usersData[0].id }, // alex follows ana
      { followerId: usersData[3].id, followingId: usersData[2].id }, // alex follows maria
      { followerId: usersData[0].id, followingId: usersData[2].id }, // ana follows maria
    ]);

    // step 17: create notifications
    console.log('creating notifications...');
    await db.insert(notifications).values([
      {
        userId: usersData[0].id,
        title: 'new comment on your post',
        message: 'dmitri commented on "anyone else struggling with pointers?"',
        notificationType: 'comment',
        relatedId: commentsData[0].id,
      },
      {
        userId: usersData[1].id,
        title: 'new reaction on your post',
        message: 'someone reacted to your post about react vs vue',
        notificationType: 'post_reaction',
        relatedId: postsData[5].id,
      },
      {
        userId: usersData[2].id,
        title: 'new review received',
        message: 'a student left a review for your algorithms course',
        notificationType: 'review',
      },
    ]);

    console.log('database seeded successfully!');
    console.log('summary:');
    console.log(`- ${usersData.length} users created`);
    console.log(`- ${facultiesData.length} faculties`);
    console.log(`- ${coursesData.length} courses`);
    console.log(`- ${channelsData.length} channels`);
    console.log(`- ${postsData.length} posts`);
    console.log(`- ${commentsData.length} comments`);
    console.log('- reactions, reviews, and relationships galore!');
  } catch (error) {
    console.error('seeding failed:', error);
    throw error;
  }
}

async function main() {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL === undefined ||
    process.env.SUPABASE_SECRET_KEY === undefined
  ) {
    console.error('missing SUPABASE env vars, cannot continue');
    console.error(
      'make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are set in .env.local'
    );
    throw new Error('missing SUPABASE env vars');
  }
  try {
    await truncateAllTables();
    await seedDatabase();
    console.log('all done!');

    return 0;
  } catch (error) {
    console.error('script failed:', error);
    throw error;
  }
}

await main();
