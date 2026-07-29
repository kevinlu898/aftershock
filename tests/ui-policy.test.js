const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.(js|jsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

test("functional icons only use Lucide", () => {
  const forbidden = [
    "@expo/vector-icons",
    "expo-symbols",
    "react-native-vector-icons",
  ];
  const violations = [];

  for (const file of sourceFiles(srcRoot)) {
    const source = fs.readFileSync(file, "utf8");
    for (const packageName of forbidden) {
      if (source.includes(packageName)) {
        violations.push(`${path.relative(projectRoot, file)} imports ${packageName}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("the skeleton system uses approved timing and reduced motion", () => {
  const source = fs.readFileSync(
    path.join(srcRoot, "components", "ui", "skeleton.jsx"),
    "utf8"
  );

  assert.match(source, /delay = 150/);
  assert.match(source, /minimumDuration = 250/);
  assert.match(source, /isReduceMotionEnabled/);
  assert.match(source, /reduceMotionChanged/);
  assert.match(source, /export function ScreenSkeleton/);
});

test("slow initial page loads use delayed skeletons", () => {
  const expectedScreens = [
    "screens/dashboard/DashboardScreen.jsx",
    "screens/dashboard/LocalRiskScreen.jsx",
    "screens/dashboard/NewsScreen.jsx",
    "screens/prepare/PrepareScreen.jsx",
    "screens/prepare/MyPlanScreen.jsx",
    "screens/prepare/ContactInfoScreen.jsx",
    "screens/prepare/MedicalInfoScreen.jsx",
    "screens/prepare/ImportantDocumentsScreen.jsx",
    "screens/emergency/EmergencyScreen.jsx",
    "screens/epicenter-ai/EpicenterAIScreen.jsx",
    "screens/profile/ChangeDetailsScreen.jsx",
  ];

  for (const relativePath of expectedScreens) {
    const source = fs.readFileSync(path.join(srcRoot, relativePath), "utf8");
    assert.match(
      source,
      /useDelayedSkeleton/,
      `${relativePath} must use the delayed skeleton policy`
    );
  }
});

test("account creation uses the approved three-step email flow", () => {
  const source = fs.readFileSync(
    path.join(srcRoot, "screens", "profile", "AccountCreationScreen.jsx"),
    "utf8"
  );

  assert.match(source, /Step \$\{step\} of 3/);
  assert.match(source, /label="Name"/);
  assert.match(source, /label="Email"/);
  assert.match(source, /label="Password"/);
  assert.match(source, /label="Zip code"/);
  assert.match(source, /label="Phone number"/);
  assert.doesNotMatch(source, /label="Username"/);
  assert.doesNotMatch(source, /Enter Username/i);
});

test("global navigation avoids labels, eyebrows, and tracking utilities", () => {
  const tabSource = fs.readFileSync(
    path.join(srcRoot, "application", "navigation", "MainTabNavigator.jsx"),
    "utf8"
  );
  assert.match(tabSource, /tabBarShowLabel:\s*false/);

  const violations = [];
  for (const file of sourceFiles(srcRoot)) {
    const source = fs.readFileSync(file, "utf8");
    if (/eyebrow=|tracking-(tight|wide|wider|widest)/.test(source)) {
      violations.push(path.relative(projectRoot, file));
    }
  }
  assert.deepEqual(violations, []);
});

test("lesson pages receive varied Lucide icon names", () => {
  const source = fs.readFileSync(
    path.join(srcRoot, "lib", "prepareModules.js"),
    "utf8"
  );
  for (const icon of [
    "book-open",
    "layers",
    "lightbulb",
    "shield",
    "play",
    "list-checks",
    "brain",
  ]) {
    assert.match(source, new RegExp(`['"]${icon}['"]`));
  }
});
