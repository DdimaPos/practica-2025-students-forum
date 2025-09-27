import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  date,
  decimal,
  unique,
  index,
  foreignKey,
  uuid,
} from 'drizzle-orm/pg-core';
import { authUsers } from 'drizzle-orm/supabase';

// Enums
export const userTypeEnum = pgEnum('user_type', [
  'student',
  'professor',
  'admin',
]);
export const degreeTypeEnum = pgEnum('degree_type', [
  'bachelor',
  'master',
  'phd',
]);
export const channelTypeEnum = pgEnum('channel_type', [
  'general',
  'academic',
  'social',
  'announcements',
  'local',
]);
export const postTypeEnum = pgEnum('post_type', ['basic', 'poll', 'event']);
export const reactionTypeEnum = pgEnum('reaction_type', ['upvote', 'downvote']);
export const eventTypeEnum = pgEnum('event_type', [
  'class',
  'exam',
  'assignment',
  'personal',
  'meeting',
]);
// export const roomTypeEnum = pgEnum('room_type', ['direct', 'group']);
// export const messageTypeEnum = pgEnum('message_type', [
//   'text',
//   'image',
//   'file',
// ]);
export const notificationTypeEnum = pgEnum('notification_type', [
  'post_reaction',
  'comment',
  'review',
  'chat',
  'system',
]);
export const ratingCategoryEnum = pgEnum('rating_category', [
  'academic_help',
  'collaboration',
  'leadership',
  'social',
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  authId: uuid('auth_id').references(() => authUsers.id, {
    onDelete: 'cascade',
  }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }).unique().notNull(),
  userType: userTypeEnum('user_type').notNull(),
  profilePictureUrl: varchar('profile_picture_url', { length: 500 }),
  bio: text('bio'),
  yearOfStudy: integer('year_of_study'),
  isVerified: boolean('is_verified').default(false),
});

export const faculties = pgTable('faculties', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  deanName: varchar('dean_name', { length: 200 }),
  establishedYear: integer('established_year'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const specialities = pgTable('specialities', {
  id: serial('id').primaryKey(),
  facultyId: integer('faculty_id').references(() => faculties.id, {
    onDelete: 'cascade',
  }),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  durationYears: integer('duration_years').default(4),
  degreeType: degreeTypeEnum('degree_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSpecialities = pgTable(
  'user_specialities',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    specialityId: integer('speciality_id').references(() => specialities.id, {
      onDelete: 'cascade',
    }),
    enrollmentDate: date('enrollment_date'),
    graduationDate: date('graduation_date'),
    isCurrent: boolean('is_current').default(true),
  },
  table => [unique().on(table.userId, table.specialityId)]
);

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 20 }).unique().notNull(),
  description: text('description'),
  credits: integer('credits').default(3),
  facultyId: integer('faculty_id').references(() => faculties.id),
  semester: integer('semester'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const courseProfessors = pgTable(
  'course_professors',
  {
    id: serial('id').primaryKey(),
    courseId: integer('course_id').references(() => courses.id, {
      onDelete: 'cascade',
    }),
    professorId: integer('professor_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    academicYear: varchar('academic_year', { length: 10 }),
    isPrimary: boolean('is_primary').default(false),
  },
  table => [unique().on(table.courseId, table.professorId, table.academicYear)]
);

// Channels & Posts
export const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  channelType: channelTypeEnum('channel_type').notNull(),
  facultyId: integer('faculty_id').references(() => faculties.id),
  specialityId: integer('speciality_id').references(() => specialities.id),
  isApproved: boolean('is_approved').default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable(
  'posts',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 300 }).notNull(),
    content: text('content').notNull(),
    postType: postTypeEnum('post_type').default('basic'),
    authorId: integer('author_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    channelId: integer('channel_id').references(() => channels.id),
    isAnonymous: boolean('is_anonymous').default(false),
    locationLat: decimal('location_lat', { precision: 10, scale: 8 }),
    locationLng: decimal('location_lng', { precision: 11, scale: 8 }),
    eventDate: timestamp('event_date'),
    eventLocation: varchar('event_location', { length: 300 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_posts_author_created').on(table.authorId, table.createdAt),
    index('idx_posts_channel_created').on(table.channelId, table.createdAt),
  ]
);

export const pollOptions = pgTable('poll_options', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, {
    onDelete: 'cascade',
  }),
  optionText: varchar('option_text', { length: 500 }).notNull(),
  voteCount: integer('vote_count').default(0),
  optionOrder: integer('option_order').notNull(),
});

export const pollVotes = pgTable(
  'poll_votes',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    pollOptionId: integer('poll_option_id').references(() => pollOptions.id, {
      onDelete: 'cascade',
    }),
    votedAt: timestamp('voted_at').defaultNow(),
  },
  table => [unique().on(table.userId, table.pollOptionId)]
);

export const postReactions = pgTable(
  'post_reactions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    postId: integer('post_id').references(() => posts.id, {
      onDelete: 'cascade',
    }),
    reactionType: reactionTypeEnum('reaction_type').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [unique().on(table.userId, table.postId)]
);

export const comments = pgTable(
  'comments',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id').references(() => posts.id, {
      onDelete: 'cascade',
    }),
    authorId: integer('author_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    parentCommentId: integer('parent_comment_id'),
    content: text('content').notNull(),
    isAnonymous: boolean('is_anonymous').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: 'fk_parent_comment',
    }),
    index('idx_comments_post_created').on(table.postId, table.createdAt),
  ]
);

export const commentReactions = pgTable(
  'comment_reactions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    commentId: integer('comment_id').references(() => comments.id, {
      onDelete: 'cascade',
    }),
    reactionType: reactionTypeEnum('reaction_type').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [unique().on(table.userId, table.commentId)]
);

// Reviews & Ratings
export const professorReviews = pgTable(
  'professor_reviews',
  {
    id: serial('id').primaryKey(),
    reviewerId: integer('reviewer_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    courseProfessorsId: integer('course_professor_id').references(
      () => courseProfessors.id,
      { onDelete: 'cascade' }
    ),
    overallRating: integer('overall_rating'),
    teachingQuality: integer('teaching_quality'),
    communication: integer('communication'),
    helpfulness: integer('helpfulness'),
    reviewText: text('review_text'),
    isAnonymous: boolean('is_anonymous').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    unique().on(table.reviewerId, table.courseProfessorsId),
    index('idx_professor_reviews_prof').on(table.courseProfessorsId),
  ]
);

export const studentRatings = pgTable(
  'student_ratings',
  {
    id: serial('id').primaryKey(),
    ratedStudentId: integer('rated_student_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    raterId: integer('rater_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    category: ratingCategoryEnum('category').notNull(),
    rating: integer('rating'),
    comment: text('comment'),
    isAnonymous: boolean('is_anonymous').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    unique().on(table.ratedStudentId, table.raterId, table.category),
    index('idx_student_ratings_student').on(table.ratedStudentId),
  ]
);

// Schedule & Calendar
// export const userSchedules = pgTable('user_schedules', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
//   title: varchar('title', { length: 200 }).notNull(),
//   description: text('description'),
//   eventType: eventTypeEnum('event_type').notNull(),
//   startDatetime: timestamp('start_datetime').notNull(),
//   endDatetime: timestamp('end_datetime').notNull(),
//   location: varchar('location', { length: 300 }),
//   courseId: integer('course_id').references(() => courses.id),
//   isRecurring: boolean('is_recurring').default(false),
//   recurrencePattern: varchar('recurrence_pattern', { length: 100 }),
//   createdAt: timestamp('created_at').defaultNow(),
// });

// Chat System
// export const chatRooms = pgTable('chat_rooms', {
//   id: serial('id').primaryKey(),
//   roomType: roomTypeEnum('room_type').notNull(),
//   name: varchar('name', { length: 200 }),
//   createdBy: integer('created_by').references(() => users.id),
//   createdAt: timestamp('created_at').defaultNow(),
// });
//
// export const chatParticipants = pgTable(
//   'chat_participants',
//   {
//     id: serial('id').primaryKey(),
//     roomId: integer('room_id').references(() => chatRooms.id, {
//       onDelete: 'cascade',
//     }),
//     userId: integer('user_id').references(() => users.id, {
//       onDelete: 'cascade',
//     }),
//     joinedAt: timestamp('joined_at').defaultNow(),
//     isAdmin: boolean('is_admin').default(false),
//   },
//   table => [unique().on(table.roomId, table.userId)]
// );
//
// export const chatMessages = pgTable(
//   'chat_messages',
//   {
//     id: serial('id').primaryKey(),
//     roomId: integer('room_id').references(() => chatRooms.id, {
//       onDelete: 'cascade',
//     }),
//     senderId: integer('sender_id').references(() => users.id, {
//       onDelete: 'cascade',
//     }),
//     messageText: text('message_text').notNull(),
//     messageType: messageTypeEnum('message_type').default('text'),
//     fileUrl: varchar('file_url', { length: 500 }),
//     isRead: boolean('is_read').default(false),
//     createdAt: timestamp('created_at').defaultNow(),
//   },
//   table => [
//     index('idx_chat_messages_room_created').on(table.roomId, table.createdAt),
//   ]
// );

// Notifications & Social
export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    title: varchar('title', { length: 200 }).notNull(),
    message: text('message').notNull(),
    notificationType: notificationTypeEnum('notification_type').notNull(),
    relatedId: integer('related_id'),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [index('idx_notifications_user_read').on(table.userId, table.isRead)]
);

export const userFollowers = pgTable(
  'user_followers',
  {
    id: serial('id').primaryKey(),
    followerId: integer('follower_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    followingId: integer('following_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [unique().on(table.followerId, table.followingId)]
);
