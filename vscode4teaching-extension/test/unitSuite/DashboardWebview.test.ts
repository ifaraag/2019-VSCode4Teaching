import * as cheerio from "cheerio";
import { mocked } from "ts-jest/utils";
import * as vscode from "vscode";
import { DashboardWebview } from "../../src/components/dashboard/DashboardWebview";
import { Exercise } from "../../src/model/serverModel/exercise/Exercise";
import { ExerciseUserInfo } from "../../src/model/serverModel/exercise/ExerciseUserInfo";
import { User } from "../../src/model/serverModel/user/User";

jest.mock("vscode");
const mockedVscode = mocked(vscode, true);

describe("Dashboard webview", () => {
    it("should be created if it doesn't exist", () => {
        const exercise: Exercise = {
            id: 1,
            name: "Exercise 1",
        };
        const student1: User = {
            id: 2,
            username: "student1",
            name: "Student",
            lastName: "1",
            roles: [
                { roleName: "ROLE_STUDENT" },
            ],
        };
        const student2: User = {
            id: 3,
            username: "student2",
            name: "Student",
            lastName: "2",
            roles: [
                { roleName: "ROLE_STUDENT" },
            ],
        };
        const euis: ExerciseUserInfo[] = [];
        euis.push({
            exercise,
            user: student1,
            finished: false,
        });
        euis.push({
            exercise,
            user: student2,
            finished: true,
        });
        DashboardWebview.show(euis, exercise.id);
        if (DashboardWebview.currentPanel) {
            expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
            expect(mockedVscode.window.createWebviewPanel.mock.calls[0][0]).toBe("v4tdashboard");
            expect(mockedVscode.window.createWebviewPanel.mock.calls[0][1]).toBe("V4T Dashboard: Exercise 1");
            expect(mockedVscode.window.createWebviewPanel.mock.calls[0][2]).toBe(mockedVscode.ViewColumn.One);
            if (mockedVscode.window.createWebviewPanel.mock.calls[0][3]) {
                expect(mockedVscode.window.createWebviewPanel.mock.calls[0][3].enableScripts).toBe(true);
                expect(mockedVscode.window.createWebviewPanel.mock.calls[0][3].localResourceRoots)
                    .toStrictEqual([mockedVscode.Uri.file(DashboardWebview.resourcesPath)]);
            } else {
                fail("Webview options argument missing");
            }
            const $ = cheerio.load(DashboardWebview.currentPanel.panel.webview.html);
            // Title is correct
            const title = $("title");
            expect(title.text()).toBe("V4T Dashboard: Exercise 1");
            // Reload button exists
            const reloadButton = $("#button-reload");
            expect(reloadButton).toBeTruthy();
            // Select and its options are correct
            const select = $("#time-reload");
            expect(select).toBeTruthy();
            const options = $("#time-reload option").toArray();
            expect(options.length).toBe(5);
            expect(options[0].attribs.value).toBe("0");
            expect(options[0].firstChild.data).toBe("Never");
            // Selected default is Never
            expect(options[0].attribs.selected).toBe("");
            expect(options[1].attribs.value).toBe("5");
            expect(options[1].firstChild.data).toBe("5 seconds");
            expect(options[2].attribs.value).toBe("30");
            expect(options[2].firstChild.data).toBe("30 seconds");
            expect(options[3].attribs.value).toBe("60");
            expect(options[3].firstChild.data).toBe("1 minute");
            expect(options[4].attribs.value).toBe("300");
            expect(options[4].firstChild.data).toBe("5 minutes");
            // Table headers are correct
            const tableHeaders = $("th").toArray();
            expect(tableHeaders[0].firstChild.data).toBe("Full name");
            expect(tableHeaders[1].firstChild.data).toBe("Username");
            expect(tableHeaders[2].firstChild.data).toBe("Exercise status");
            // Table data is correct
            const tableData = $("td").toArray();
            expect(tableData[0].firstChild.data).toBe("Student 1");
            expect(tableData[1].firstChild.data).toBe("student1");
            expect(tableData[2].firstChild.data).toBe("On progress");
            expect(tableData[2].attribs.class).toBe("onprogress-cell");
            expect(tableData[3].firstChild.data).toBe("Student 2");
            expect(tableData[4].firstChild.data).toBe("student2");
            expect(tableData[5].firstChild.data).toBe("Finished");
            expect(tableData[5].attribs.class).toBe("finished-cell");
        } else {
            fail("Current panel wasn't created");
        }
    });
});
