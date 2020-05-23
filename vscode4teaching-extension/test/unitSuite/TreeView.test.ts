import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { APIClient } from "../../src/client/APIClient";
import { CurrentUser } from "../../src/client/CurrentUser";
import { CoursesProvider } from "../../src/components/courses/CoursesTreeProvider";
import { V4TBuildItems } from "../../src/components/courses/V4TItem/V4TBuiltItems";
import { V4TItem } from "../../src/components/courses/V4TItem/V4TItem";
import { V4TItemType } from "../../src/components/courses/V4TItem/V4TItemType";
import { Validators } from "../../src/components/courses/Validators";
import { User } from "../../src/model/serverModel/user/User";
import { FileZipUtil } from "../../src/utils/FileZipUtil";

jest.mock("../../src/client/CurrentUser");
const mockedCurrentUser = mocked(CurrentUser, true);
jest.mock("../../src/client/APIClient");
const mockedClient = mocked(APIClient, true);
jest.mock("../../src/utils/FileZipUtil");
const mockedFileZipUtil = mocked(FileZipUtil, true);
jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

let coursesProvider = new CoursesProvider();
const coursesModel = [
    {
        id: 2,
        name: "Test course 1",
        exercises: [
            {
                id: 4,
                name: "Exercise 1",
            },
            {
                id: 40,
                name: "Exercise 2",
            },
        ],
    },
    {
        id: 3,
        name: "Test course 2",
        exercises: [
            {
                id: 5,
                name: "Exercise 1",
            },
        ],
    },
];

const mockedUserTeacherModel: User = {
    id: 1,
    username: "johndoe",
    roles: [{
        roleName: "ROLE_STUDENT",
    }, {
        roleName: "ROLE_TEACHER",
    }],
    courses: [
        {
            id: 2,
            name: "Test course 1",
            exercises: [
                {
                    id: 4,
                    name: "Exercise 1",
                },
                {
                    id: 40,
                    name: "Exercise 2",
                },
            ],
        },
        {
            id: 3,
            name: "Test course 2",
            exercises: [
                {
                    id: 5,
                    name: "Exercise 1",
                },
            ],
        },
    ],
};
const mockedUserStudentModel: User = {
    id: 1,
    username: "johndoe",
    roles: [{
        roleName: "ROLE_STUDENT",
    }],
    courses: coursesModel,
};
let mockedUser = mockedUserTeacherModel;

describe("Tree View", () => {
    afterEach(() => {
        mockedCurrentUser.isLoggedIn.mockClear();
        mockedCurrentUser.updateUserInfo.mockClear();
        mockedCurrentUser.getUserInfo.mockClear();
        mockedVscode.EventEmitter.mockClear();
        mockedVscode.window.showInputBox.mockClear();
        mockedClient.initializeSessionFromFile.mockClear();
        coursesProvider = new CoursesProvider();
        mockedUser = mockedUserTeacherModel;
    });

    it("should show log in buttons when not logged in and session could not be initialized", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => false);
        mockedClient.initializeSessionFromFile.mockImplementation(() => false);

        const elements = coursesProvider.getChildren();

        if (elements) {
            expect(elements).toStrictEqual([V4TBuildItems.LOGIN_ITEM, V4TBuildItems.SIGNUP_ITEM]);
        } else {
            fail("No elements returned");
        }
    });

    it("should update user info when session is initialized", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => false);
        mockedClient.initializeSessionFromFile.mockImplementation(() => true);
        mockedCurrentUser.updateUserInfo.mockResolvedValueOnce(mockedUser);

        const elements = coursesProvider.getChildren();

        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
        expect(elements).toStrictEqual([]); // Don't return anything while updating
    });

    it("should show courses, add courses, sign up teacher and logout buttons when teacher is logged in", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => true);
        mockedCurrentUser.getUserInfo.mockImplementation(() => mockedUser);
        const coursesItemsTeacher = coursesModel.map((course) => new V4TItem(course.name, V4TItemType.CourseTeacher, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
        coursesItemsTeacher.unshift(V4TBuildItems.ADD_COURSES_ITEM);
        coursesItemsTeacher.push(V4TBuildItems.SIGNUP_TEACHER_ITEM);
        coursesItemsTeacher.push(V4TBuildItems.LOGOUT_ITEM);

        const elements = coursesProvider.getChildren();

        expect(elements).toStrictEqual(coursesItemsTeacher);
    });

    it("should show courses when teacher is logged in", () => {
        mockedCurrentUser.isLoggedIn.mockImplementation(() => true);
        mockedUser = mockedUserStudentModel;
        mockedCurrentUser.getUserInfo.mockImplementation(() => mockedUser);
        const coursesItemsStudent = coursesModel.map((course) => new V4TItem(course.name, V4TItemType.CourseStudent, vscode.TreeItemCollapsibleState.Collapsed, undefined, course));
        coursesItemsStudent.unshift(V4TBuildItems.GET_WITH_CODE_ITEM);
        coursesItemsStudent.push(V4TBuildItems.LOGOUT_ITEM);

        const elements = coursesProvider.getChildren();

        expect(elements).toStrictEqual(coursesItemsStudent);
    });

    it("should show login form correctly then call login", async () => {
        const mockUrl = "http://test.com:12345";
        const mockUsername = "johndoe";
        const mockPassword = "password";
        mockedVscode.window.showInputBox
            .mockResolvedValueOnce("http://test.com:12345")
            .mockResolvedValueOnce("johndoe")
            .mockResolvedValueOnce("password");
        const inputOptionsURL = {
            prompt: "Server",
            value: mockUrl,
            validateInput: Validators.validateUrl,
        };
        const inputOptionsUsername = {
            prompt: "Username",
            validateInput: Validators.validateUsername,
        };
        const inputOptionsPassword = {
            prompt: "Password",
            password: true,
            validateInput: Validators.validatePasswordLogin,
        };
        mockedClient.loginV4T.mockResolvedValue();

        await coursesProvider.login();

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(3);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsURL);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(2, inputOptionsUsername);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(3, inputOptionsPassword);
        expect(mockedClient.loginV4T).toHaveBeenLastCalledWith(mockUsername, mockPassword, mockUrl);
    });

    it("should logout correctly", () => {
        coursesProvider.logout();
        expect(mockedClient.invalidateSession).toHaveBeenCalledTimes(1);
    });

    it("should add course", async () => {
        const courseModel = {
            name: "Test course 1",
        };
        mockedVscode.window.showInputBox
            .mockResolvedValueOnce(courseModel.name);
        const inputOptionsCourse = {
            prompt: "Course name",
            validateInput: Validators.validateCourseName,
        };
        mockedClient.addCourse.mockResolvedValueOnce({
            data: {
                id: 1,
                name: courseModel.name,
                exercises: [],
            },
            status: 201,
            statusText: "",
            headers: [],
            config: {},
        });
        mockedCurrentUser.updateUserInfo.mockResolvedValueOnce(
            mockedUser,
        );

        await coursesProvider.addCourse();

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsCourse);
        expect(mockedClient.addCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.addCourse).toHaveBeenLastCalledWith(courseModel);
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    it("should edit course", async () => {
        const courseModelToEdit = new V4TItem(
            coursesModel[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            coursesModel[0],
            undefined,
        );
        const newCourseModel = {
            name: "Test course 1 edited",
        };
        mockedVscode.window.showInputBox
            .mockResolvedValueOnce(newCourseModel.name);
        const inputOptionsCourse = {
            prompt: "Course name",
            validateInput: Validators.validateCourseName,
        };
        mockedClient.editCourse.mockResolvedValueOnce({
            data: {
                id: 2,
                name: newCourseModel.name,
                exercises: coursesModel[0].exercises,
            },
            status: 200,
            statusText: "",
            headers: [],
            config: {},
        });
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(
            mockedUser,
        );

        await coursesProvider.editCourse(courseModelToEdit);

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsCourse);
        expect(mockedClient.editCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.editCourse).toHaveBeenLastCalledWith(coursesModel[0].id, newCourseModel);
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    it("should delete course", async () => {
        const courseModelToDelete = new V4TItem(
            coursesModel[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            coursesModel[0],
            undefined,
        );
        mockedClient.deleteCourse.mockResolvedValueOnce({
            status: 200,
            statusText: "",
            headers: [],
            config: {},
            data: undefined,
        });
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.getUserInfo.mockReturnValueOnce(
            mockedUser,
        );

        await coursesProvider.deleteCourse(courseModelToDelete);

        expect(mockedClient.deleteCourse).toHaveBeenCalledTimes(1);
        expect(mockedClient.deleteCourse).toHaveBeenLastCalledWith(coursesModel[0].id);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showWarningMessage).toHaveBeenLastCalledWith("Are you sure you want to delete " + coursesModel[0].name + "?", { modal: true }, "Accept");
        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    it("should refresh courses", async () => {
        mockedCurrentUser.isLoggedIn.mockReturnValueOnce(true);
        mockedCurrentUser.updateUserInfo.mockResolvedValueOnce(mockedUser);

        coursesProvider.refreshCourses();

        expect(mockedCurrentUser.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    it("should add exercise", async () => {
        const courseModel = new V4TItem(
            coursesModel[0].name,
            V4TItemType.CourseTeacher,
            mockedVscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            coursesModel[0],
            undefined,
        );
        const exerciseModel = {
            name: "New exercise",
        };

        mockedVscode.window.showInputBox
            .mockResolvedValueOnce(exerciseModel.name);
        const inputOptionsExercise = {
            prompt: "Exercise name",
            validateInput: Validators.validateExerciseName,
        };

        const openDialogOptions = {
            canSelectFiles: true,
            canSelectFolders: true,
            canSelectMany: true,
        };
        const fileUrisMocks = [
            mockedVscode.Uri.file("testFile1"),
            mockedVscode.Uri.file("testFile2"),
            mockedVscode.Uri.file("testFile3"),
        ];
        mockedVscode.window.showOpenDialog.mockResolvedValueOnce(fileUrisMocks);

        mockedClient.addExercise.mockResolvedValueOnce({
            status: 201,
            statusText: "",
            headers: [],
            config: {},
            data: {
                id: 10,
                name: exerciseModel.name,
            },
        });

        const mockBuffer = Buffer.from("test");
        mockedFileZipUtil.getZipFromUris.mockResolvedValueOnce(mockBuffer);

        mockedClient.uploadExerciseTemplate.mockResolvedValueOnce({
            status: 200,
            statusText: "",
            headers: [],
            config: {},
            data: {
            },
        });

        await coursesProvider.addExercise(courseModel);

        expect(mockedVscode.window.showInputBox).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showInputBox).toHaveBeenNthCalledWith(1, inputOptionsExercise);
        expect(mockedVscode.window.showOpenDialog).toHaveBeenCalledTimes(1);
        expect(mockedVscode.window.showOpenDialog).toHaveBeenNthCalledWith(1, openDialogOptions);
        expect(mockedClient.addExercise).toHaveBeenCalledTimes(1);
        expect(mockedClient.addExercise).toHaveBeenNthCalledWith(1, coursesModel[0].id, { name: exerciseModel.name });
        expect(mockedFileZipUtil.getZipFromUris).toHaveBeenCalledTimes(1);
        expect(mockedFileZipUtil.getZipFromUris).toHaveBeenNthCalledWith(1, fileUrisMocks);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenCalledTimes(1);
        expect(mockedClient.uploadExerciseTemplate).toHaveBeenNthCalledWith(1, 10, mockBuffer);
    });
});
