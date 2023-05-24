import React, {useState} from "react";
import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function Signup({ navigation }){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onHandleSignup = () => {
        if (email !== '' && password !== '')
            createUserWithEmailAndPassword(auth, email, password)
            .then(() => console.log('Signup success'))
            .catch((err) => Alert.alert('Signup error', err.message));
    };

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <Text style={styles.title}>Sign Up</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="Enter email"
                    autoCapitalize="none"
                    keyboardType="email-adress"
                    textContentType="emailAddress"
                    autoFocus={true}
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput 
                    style={styles.input}
                    placeholder="Enter password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    textContentType="password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
                <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
                    <Text>Sign Up</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:40,
        paddingHorizontal:20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        alignSelf: "center",
        marginTop: 40,
        color: '#f57c00',
    },
    input: {
        fontSize: 16,
        padding: 12,
    },
    button: {
        backgroundColor: '#f57c00',
        height: 58,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
})


