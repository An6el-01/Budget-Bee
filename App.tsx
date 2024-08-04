import * as React from "react";
import { SQLiteProvider } from "expo-sqlite/next";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './navigationTypes'; // Import the navigation types

//Screens
import Home from "./screens/Home";
import Settings from "./screens/Settings";
import Statistics from "./screens/Statistics";
import Goals from "./screens/Goals";
import NewTransaction from "./screens/NewTransaction";
import YearlySummary from "./screens/YearlySummary";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>(); // Use the navigation types

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

const loadDatabase = async () => {
  const dbName = "mySQLiteDB.db";
  const dbAsset = require("./assets/mySQLiteDB.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
};

const StatisticsStack = () => {
  return(
    <Stack.Navigator>
    <Stack.Screen name="StatisticsMain" component={Statistics}/>
    <Stack.Screen name="YearlySummary" component={YearlySummary}/> 
  </Stack.Navigator>
  );
}



export default function App() {
  const [dbLoaded, setDbLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    loadDatabase()
      .then(() => setDbLoaded(true))
      .catch((e) => console.error(e));
  }, []);

  if (!dbLoaded)
    return (
      <View style={styles.container}>
        <ActivityIndicator size={"large"} />
        <Text>Loading Database...</Text>
      </View>
    );
  return (
    <NavigationContainer>
      <React.Suspense
        fallback={
          <View style={styles.container}>
            <ActivityIndicator size={"large"} />
            <Text>Loading Database...</Text>
          </View>
        }
      >
        <SQLiteProvider databaseName="mySQLiteDB.db" useSuspense>
          <Tab.Navigator 
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Home"){
                  iconName = focused ? "home" : "home-outline";
                }else if (route.name === "Statistics"){
                  iconName =  focused ? "bar-chart" : "bar-chart-outline";
                }else if(route.name === "Goals"){
                  iconName = focused ? "trophy" : "trophy-outline";
                }else if (route.name === "Settings"){
                  iconName =  focused ? "settings" : "settings-outline";
                }else if (route.name === "NewTransaction") {
                  iconName = focused ? "add-circle" : "add-circle-outline";
                }
                return <Ionicons name={iconName as "key"} size={size} color={color} />;
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.text,
            })}
            >
            <Tab.Screen name = "Home" component={Home}/>
            <Tab.Screen name = "Statistics" component={StatisticsStack} />
            <Tab.Screen name = "NewTransaction" component={NewTransaction} options={{ title: 'New Entry' }} />
            <Tab.Screen name = "Goals" component={Goals} />
            <Tab.Screen name = "Settings" component={Settings} />
          </Tab.Navigator>
        </SQLiteProvider>        
      </React.Suspense>
    </NavigationContainer>
  );
}
