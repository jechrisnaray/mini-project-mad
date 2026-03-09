/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as announcements from "../announcements.js";
import type * as courses from "../courses.js";
import type * as grades from "../grades.js";
import type * as ospekKkn from "../ospekKkn.js";
import type * as registrations from "../registrations.js";
import type * as scheadules from "../scheadules.js";
import type * as seedCourse from "../seedCourse.js";
import type * as seedData from "../seedData.js";
import type * as teacherEvalutions from "../teacherEvalutions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  announcements: typeof announcements;
  courses: typeof courses;
  grades: typeof grades;
  ospekKkn: typeof ospekKkn;
  registrations: typeof registrations;
  scheadules: typeof scheadules;
  seedCourse: typeof seedCourse;
  seedData: typeof seedData;
  teacherEvalutions: typeof teacherEvalutions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
