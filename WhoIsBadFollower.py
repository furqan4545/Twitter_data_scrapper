import sys
import psycopg2

import numpy as np
import pandas as pd

import nltk
from nltk.corpus import stopwords
from nltk.corpus import stopwords
import string
from nltk.stem import PorterStemmer
import re
from sklearn.feature_extraction.text import CountVectorizer

import geopy
from geopy.geocoders import Nominatim
locator = Nominatim(user_agent="myGeocoder")


connection = psycopg2.connect(
    user="ubuntu",
    host="ec2-3-39-102-69.ap-northeast-2.compute.amazonaws.com",
    database="sns_app_db",
    password="password",
    port=5432,
)
connection.autocommit = True


cursor = connection.cursor()

 

''''''''''''''''''''''''''''''''''''''''Teets Collection from Twitter'''''''''''''''''''''''''''''''''''''''
import tweepy

consumerKey = 'giqxYOWnXosvhkeyzbE4V9ox8'
consumerSecret = 'hRa3cTkAvr0BfjIcLiJcwvFrF1HeFDPG5dabMyfzcdIaTmvaA3'

authenticate = tweepy.OAuthHandler(consumerKey, consumerSecret)
api = tweepy.API(authenticate, wait_on_rate_limit= True)




account = sys.argv[1]
FollowersscreenName = []
for follower in api.get_followers(screen_name=account):
    FollowersscreenName.append(follower.screen_name)
    #print(follower.screen_name)


num = 10 # total number of tweets
myFollowerTweets = []
j=1
tempLocation = ''
for i in range(len(FollowersscreenName)):
    posts = api.user_timeline(screen_name = FollowersscreenName[i], count=num, lang= "en" 
                          ,tweet_mode = "extended")
    #print("Show the ",num," recent tweets for \n", FollowersscreenName[i])
    for tweet in posts[0:num]:
        print(tweet.user.location)
        if(tweet.user.location=='' or tweet.user.location=='Error 404'):
            tempLocation = 'Peshawar, Pakistan'
            cursor.execute('INSERT into "myFollowersTweets"(username,"followerUsername", tweets, location,"tweet_user)id", tweet_created_at, tweet_id, tweet_user_followers_count,tweet_user_following_count,tweet_user_verified,profile_image_url_https) VALUES (%s,%s, %s,%s,%s,%s,%s,%s,%s,%s,%s)',(account,FollowersscreenName[i],tweet.full_text,tempLocation,tweet.user.id,tweet.created_at,tweet.id,tweet.user.followers_count,tweet.user.friends_count,tweet.user.verified,tweet.user.profile_image_url_https))
        else:
            cursor.execute('INSERT into "myFollowersTweets"(username,"followerUsername", tweets, location,"tweet_user)id", tweet_created_at, tweet_id, tweet_user_followers_count,tweet_user_following_count,tweet_user_verified,profile_image_url_https) VALUES (%s,%s, %s,%s,%s,%s,%s,%s,%s,%s,%s)',(account,FollowersscreenName[i],tweet.full_text,tweet.user.location,tweet.user.id,tweet.created_at,tweet.id,tweet.user.followers_count,tweet.user.friends_count,tweet.user.verified,tweet.user.profile_image_url_https))
        j+=1
    #print('000000000000000000000000000000000000000000000000000')

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

''''''''''''''''''''''''''''''''''''''''Teets Reading from database'''''''''''''''''''''''''''''''''''''''

cursor.execute('SELECT * FROM "myFollowersTweets" WHERE username = %s',(account,))
result = cursor.fetchall()
#print(type(result))
#print(result)

products_list = ['username', 'followerUsername', 'tweets', 'location','tweet_user)id', 'tweet_created_at', 'tweet_id', 'tweet_user_followers_count','tweet_user_following_count','tweet_user_verified','profile_image_url_https']

tweets = pd.DataFrame (result, columns = products_list)
#print(tweets['location'])

#print(type(tweets))



''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''


stop_words = set(stopwords.words("english"))
punct = string.punctuation
stemmer = PorterStemmer()



# print(stop_words)
# print(tweets.head())
# print(tweets.shape)

X = tweets['tweets']
y = tweets['location']
cleaned_data = []

for i in range(len(X)):
    tweet = re.sub('[^a-zA-Z]',' ',X.iloc[i])
    tweet = tweet.lower().split()
    tweet = [stemmer.stem(word) for word in tweet if(word not in stop_words) and (word not in punct)]
    tweet = ' '.join(tweet)
    cleaned_data.append(tweet)

#print(cleaned_data)
tweets['tweets'] = cleaned_data
#print(tweets['tweet_text'][0])



def mytokenizer(text):
    return text.split()

FinalfrequencyForWords = []
zzz = 0 ;
def colsum(username, arr, n, m,nameofPerson,locationofPerson,IDofPerson,profilePhoto,user_followers_count,user_followings_count):
    frequencyForWords = []
    frequencyForWords.append(username)
    frequencyForWords.append(nameofPerson)
    for i in range(n):
        su = 0;
        for j in range(m):
            su += arr[j][i]
        frequencyForWords.append(su)
    # print(frequencyForWords)
    frequencyForWords.append(locationofPerson)
    frequencyForWords.append(IDofPerson)
    frequencyForWords.append(profilePhoto)
    frequencyForWords.append(user_followers_count)
    frequencyForWords.append(user_followings_count)
    FinalfrequencyForWords.append(frequencyForWords)


vocab = {'fuck':0, 'bitch':1,'shit':2,'asshole':3,'motherfucker': 4, 'pussy': 5, 'bastard': 6, 'stupid': 7, 'bullshit': 8, 'idiot':9 }

#vocab = {'fuck':0, 'bitch':1,'shit':2,'asshole':3,'motherfucker': 4}
unique_Followers = tweets['followerUsername'].unique()
unique_Followers_location = tweets['location']
unique_Followers_ids = tweets['tweet_user)id'].unique()
unique_Followers_profile = tweets['profile_image_url_https'].unique()
unique_user_followers_count = tweets['tweet_user_followers_count'].unique()
unique_user_followings_count = tweets['tweet_user_following_count'].unique()



followersTweetIndividual = []
vectorizer = CountVectorizer(vocabulary=vocab, tokenizer = mytokenizer)
# print(vectorizer.get_feature_names_out())
for i in range(len(unique_Followers)):
    for j in range(len(tweets['tweets'])):
        if(unique_Followers[i]==tweets['followerUsername'][j]):
            followersTweetIndividual.append(tweets['tweets'][j])
    X = vectorizer.fit_transform(followersTweetIndividual)
    
    frequencyForBadWords = X.toarray()
    colsum(sys.argv[1],frequencyForBadWords, len(frequencyForBadWords[0]), len(frequencyForBadWords),unique_Followers[i],tweets['location'][i],unique_Followers_ids[i],unique_Followers_profile[i],unique_user_followers_count[i],unique_user_followings_count[i])


#with open('bbbadbadWordsFrequency.csv','a') as csvfile:
#    np.savetxt(csvfile, FinalfrequencyForWords,delimiter=',',header='Name, fuck, bitch, bullshit, rubbish, kiss, location',fmt='%s', comments='')

#print(FinalfrequencyForWords)
#print(FinalfrequencyForWords[0][0])

for d in range(len(FinalfrequencyForWords)):
    location = locator.geocode(FinalfrequencyForWords[d][12])
    record_to_insert = (FinalfrequencyForWords[d][0], FinalfrequencyForWords[d][1],FinalfrequencyForWords[d][2].item(),FinalfrequencyForWords[d][3].item(),FinalfrequencyForWords[d][4].item(),FinalfrequencyForWords[d][5].item(),FinalfrequencyForWords[d][6].item(),FinalfrequencyForWords[d][7].item(),FinalfrequencyForWords[d][8].item(),FinalfrequencyForWords[d][9].item(),FinalfrequencyForWords[d][10].item(),FinalfrequencyForWords[d][11].item(),FinalfrequencyForWords[d][12],location.latitude,location.longitude,FinalfrequencyForWords[d][13],FinalfrequencyForWords[d][14],FinalfrequencyForWords[d][15].item(),FinalfrequencyForWords[d][16].item())
    #print(record_to_insert)
    cursor.execute('INSERT into "tableforBadWords"("user","followerUsername", fuck, bitch, shit, asshole, motherfucker,pussy,bastard,stupid,bullshit,idiot, location,latitude, longitude, tweet_user_id,profile_image_url_https,tweet_user_followers_count,tweet_user_following_count) VALUES (%s,%s, %s,%s, %s,%s, %s, %s, %s, %s, %s,%s,%s,%s, %s,%s,%s,%s,%s)',record_to_insert )
  
  
print("List has been inserted to  table successfully...")
  
# Commit your changes in the database
connection.commit()





