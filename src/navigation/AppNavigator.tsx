import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import NoteFormScreen from '../screens/NoteFormScreen';
import { RootStackParamList } from '../types/note';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#eef2ff',
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Notes' }} />
        <Stack.Screen
          name="NoteForm"
          component={NoteFormScreen}
          options={({ route }) => ({
            title: route.params?.note ? 'Edit Note' : 'New Note',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
