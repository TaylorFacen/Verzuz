import AgoraRTC from 'agora-rtc-sdk';

const agoraAppId = process.env.REACT_APP_AGORA_APP_ID;

class AgoraClient {
    constructor() {
        this.rtc = {
            client: AgoraRTC.createClient({mode: "live", codec: "h264"}),
            joined: false,
            published: false,
            localStream: null,
            remoteStreams: [],
            params: {}
        }
    }

    joinChannel = (userType, battleName, userId, updateParticipantsCallback) => {
        this.rtc.client.setClientRole(userType === "player" ? "host" : "audience");

        const uid = userType === 'player' ? userId : userId + String(Date.now())
        // Initialize the client
        this.rtc.client.init(agoraAppId, () => {
            // Join a channel
            this.rtc.client.join(null, battleName, uid, uid => {
                this.rtc.params.uid = uid;

                if ( userType === "player" ) {
                    // Create a local stream
                    this.rtc.localStream = AgoraRTC.createStream({
                        streamId: uid,
                        audio: true,
                        video: true,
                        screen: false
                    })

                    // Initialize the local stream
                    this.rtc.localStream.init(() => {
                        // Play stream with html element id "local_stream"
                        this.rtc.localStream.play("local_stream");
                        this.rtc.client.publish(this.rtc.localStream, err => {
                            console.log("publish failed", err);
                        })
                    }, err => {
                        console.log("Init local stream failed ", err);
                    });
                }

                this.rtc.client.on("stream-added", evt => {
                    const remoteStream = evt.stream;
                    const id = remoteStream.getId();
                    if (id !== uid) {
                        this.rtc.client.subscribe(remoteStream, err => {
                            console.log("Stream subscribe failed", err);
                        })
                    }
                })

                this.rtc.client.on("stream-subscribed", evt => {
                    const remoteStream = evt.stream;
                    const id = remoteStream.getId();

                    // Play the remote stream
                    remoteStream.play("remote_video_" + id, err => {
                        // err is null if there wasn't an error
                        const isStreaming = err ? err?.video?.status === 'play' : true;
                        const isAudioConnected = err ? err?.audio?.status === 'play' : true;

                        updateParticipantsCallback(id, isStreaming, isAudioConnected)
                    });
                })

            }, err => console.log("client join failed", err))
        }, err => console.log("Client init failed", err))
    }

    leaveChannel = () => {
        this.rtc.client.leave(() => {
            if ( this.rtc.localStream ) {
                // Stop playing the local stream
                this.rtc.localStream.stop();

                // Close the local stream
                this.rtc.localStream.close();
            }

            // Stop all remote streams
            while (this.rtc.remoteStreams.length > 0) {
                const stream = this.rtc.remoteStreams.shift();
                stream.stop();
            }
        }, err => {
            console.log("Channel leave failed", err)
        })
    }
}

export default AgoraClient;