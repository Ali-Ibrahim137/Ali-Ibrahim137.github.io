---
layout: post
title:  "Polygon.Codeforces Tutorial"
date:   2020-09-27
categories: competitive-programming
permalink: /polygon-codeforces-tutorial.html
previewImage: /assets/img/previewImages/polygon-logo.webp
---
# What is Polygon
According to Polygon itself, the mission of Polygon is to provide a platform for creating programming contest problems. Polygon supports the whole development cycle:
- Problem statement writing.
- Test data preparing (generators supported).
- Model solutions (including correct and wittingly incorrect).
- Judging.
- Automatic validation.
<!--more-->

Polygon uses `testlib.h` in problem creation. This library is a standard solution in a professional community of problemsetters in Russia and several other countries. Many contests are prepared by using `testlib.h`: All-Russian school olympiads, ACM-ICPC regional contests, all Codeforces rounds, and many others. You can read more about testlib from [Codeforces blogs.](https://codeforces.com/testlib)

I think the best way to explain everything is by giving a problem and going through the whole development process, so let's start with this simple problem.

# Problem

Given an array of $$n$$ integers, you should print any prime number in the array. It's guaranteed that the array contains at least one prime number.

Constraints: $$1 \le n \le 10^3$$, $$1 \le A_i \le 10^3$$.

# Create the problem

After making an account on Polygon, the first thing you need to do is to create the problem. This can be done by clicking the **New Problem** link on the homepage. You will be asked to provide a problem name. Problem names must contain lowercase words separated by dashes. Let's name our problem `prime-number`. This image contains the Create Problem form.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/1.png)

After hitting Create, you will get something like the image. To start an edit session, let's click on **Start**.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/2.png)

# Starting with the problem

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/3.png)

There are many things to do here. We will go through them one by one, but first let's start with the **General Info** tab. This tab contains information about the problem, including:

- Input file - Input file name or "stdin" in case of standard input.
- Output file - Output file name or "stdout" in case of standard output.
- Time limit - Time limit per test in milliseconds.
- Memory limit - Memory limit in megabytes.
- Interactive - Used with interactive problems.
- Tags - Add tags to the problem.
- Contests - Add to existing contest.
- Statement and Tutorial sketch - Short description.

We will not change these values, as the default values are suitable for our problem.

### Statements

Every problem needs at least one statement. Polygon supports multiple statement languages for a problem. You can choose the language and create the statement. Let's choose `English` and hit create.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/4.png)

Problem statements are written using LaTeX. You can find several fields. These fields are:

- Name - Problem Title.
- Legend - Here you write the problem description.
- Input format - This field includes description of how the input is given.
- Output format - Description of how you should print the output.
- Notes - They appear under the sample tests, maybe a description of the samples or some other definitions not mentioned in the Legend.
- Tutorial - Problem Tutorial.
- Files - You can add any file you want to use in the statement, usually images.

After filling the fields, we can review the problem in LaTeX, HTML, or PDF. Let's view it in HTML. We should get this.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/5.png)

Note that there are no samples because we didn't add any sample tests or solutions yet.

### Files

There are three types you can upload on the "Files" tab.

- Resources - Header files, library files, and other files you need in the process of compiling your sources. All resources will be copied to the compilation folder while compiling. Some system files are also resources. For example, "problem.tex" (which will be renamed) is also a resource. You can change these files if you want to change some system behavior.

- Sources - Source files of generators, checkers (verifiers), and validator. Since you can change resources and make your sources uncompilable, it is possible to check that sources are compilable with the button "Check sources for compilability". You can use one of the prewritten checkers (a special program that checks that the answer is correct), so don't write your own if you really don't need it.

- Additional files - Any other files. It can be a problem manual in Microsoft Word format, some reports in Microsoft Excel, or pictures. You can place the problem statement here if you have a non-standard statement format (for example, Microsoft Word).

Currently we will not do anything in this tab, but we will get back to it later.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/6.png)

### Validator

We will get back to the **Checker** tab after this one. Validator is a special program to validate that all the tests satisfy the constraints from the statement. It expects to get the input file from the standard input. If it thinks that the input is incorrect, it should return a non-zero exit code and print a short message to stdout or stderr. I am not going to talk about how to write a validator because you can read about that [here.](https://codeforces.com/blog/entry/18426)

On your PC create a new file with `.cpp` extension and copy the following code:

{% highlight cpp linenos %}
#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;
bool prime(int x){
  if(x == 1)return false;
	for(int i = 2;i * i <= x;i++){
		if(x%i == 0)return false;
	}
	return true;
}
int main(int argc, char** argv){
    registerValidation(argc, argv);
    int n = inf.readInt(1, 1000,"N");
    inf.readEoln();
    bool has_prime = false;
    for(int i = 1;i <= n;i++){
		int x = inf.readInt(1, 1000, "X");
		has_prime|=prime(x);
		if(i != n)inf.readSpace();
	}
	inf.readEoln();
    ensuref(has_prime, "There is no prime number!");
    inf.readEof();
    return 0;
}
{% endhighlight %}

Validator works in strict mode, so you should check for everything to match the problem description. This includes new lines and whitespaces, so you should check that. Also, for our problem, we should check if the array contains a prime number, and this is done in line $$21$$.

Now select the file and upload it from the **Validator** tab as in the image.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/7.png)

#### Validator Tests

You can add tests to validate them and check if your validator handles every possible case correctly. Let's add some tests using ***Add test***. For every test you add, you should add its verdict: $$1$$ or `VALID` if this test is valid, and $$0$$ or `INVALID` otherwise. You can add multiple tests by separating the tests with a line containing three equal signs $$===$$.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/8.png)

Now select the tests and hit ***Run tests***, wait for a couple of seconds and you will get the verdict of these tests as the following.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/9.png)

### Checker

Checker is a program that should be written when the task allows more than one correct solution. A common convention is that a checker should be a program taking three command-line arguments: the testdata filename, the participant output filename, and the jury answer filename. Checker should read the contents of the input, output, and answer, decide whether the participant answer is correct (and optimal compared to the jury's answer if there can be a non-optimal answer in this task), and return one of several predefined verdicts. Same as Validator, I am not going to talk about how to write a checker because you can read about that [here.](https://codeforces.com/blog/entry/18431)

Polygon has some prewritten checkers. You can use any of them if the problem contains one correct answer; you can use the one that is best for your problem.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/10.png)

In our problem, there can be multiple correct answers. That's why we will be writing our own checker. Same as we did with the validator, on your PC create a new file with `.cpp` extension and copy the following code:

{% highlight cpp linenos %}
#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;
int n;
bool has[1010];
bool prime(int x){
  if(x == 1)return false;
	for(int i = 2; i * i <= x;i++){
		if(x%i == 0)return false;
	}
	return true;
}
int readAns(InStream& stream) {
    int ans = stream.readInt(1, 1000);
    if(has[ans] == 0)return -1;
    if(prime(ans) == 0)return 0;
    return 1;
}

int main(int argc, char * argv[]){
    registerTestlibCmd(argc, argv);
    int n = inf.readInt();
    for(int i=0;i<n;i++){
		int x = inf.readInt();
		has[x] = 1;
	}

  int jans = readAns(ans);
  int pans = readAns(ouf);
  if(jans==0)quitf(_fail, "Jury answer Incorrect, The number is not prime!!!");
  if(jans==-1)quitf(_fail, "Jury answer Incorrect, the number is not from the input array!!!");
  if(pans==0)quitf(_wa, "participant answer Incorrect, The number is not prime.");
  if(pans==-1)quitf(_wa, "participant answer Incorrect, the number is not from the input array.");
  if (!ans.seekEof())quitf(_fail, "Jury answer contain extra tokens!!!");
  if (!ouf.seekEof())quitf(_wa, "Participant answer contain extra tokens.");
  quitf(_ok, "Passed all tests.");
}
{% endhighlight %}

#### Checker Tests

Similar to validator, you can add checker tests to check if your checker handles every possible case correctly. Let's add some tests using ***Add test***. Provide the input test, participant output, jury answer, and the expected verdict.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/11.png)

Now select the tests and hit ***Run tests***, wait for a couple of seconds and you will get the verdict of these tests as the following.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/12.png)

### Tests

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/13.png)

There are three ways to add tests:

1. Use "Add Test" form - it is good way to manual test.

2. Use "script" - you can add a generator file and pass any arguments to the generator. Generators are helper programs that output tests. Most programming tasks usually have a large input (for example, an array of up to $$2 * 10^5$$ elements, a tree of up to $$10^5$$ vertices), so it's not possible to add all the tests manually. In these cases, generators come to the rescue. You can read more about generators [here.](https://codeforces.com/blog/entry/18291)

3. Use "Add tests from archive" feature - upload a ZIP file with the tests.

To use the first way, click on ***Add Test*** and add your tests. If you want this test to be used as a sample test, just click on ***Use in statements***. Polygon also gives you the ability to specify custom content of input or output data for statements. To use the third way, you can click on ***Here you can add several tests from the archive or from the files*** and upload your files. Now, for the second way, on your PC create a new file with `.cpp` extension and copy the following code:

{% highlight cpp linenos %}
#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;
bool prime(int x){
  if(x == 1)return false;
	for(int i = 2; i * i <= x;i++){
		if(x%i == 0)return false;
	}
	return true;
}
int main(int argc, char* argv[]){
	registerGen(argc, argv, 1);
	int min_n = atoi(argv[1]);
	int max_n = atoi(argv[1]);
	int n = rnd.next(min_n, max_n);
	cout<<n<<endl;
	vector<int>a(n);
	bool has_prime = false;
	for(int i = 0;i < n;i++){
		a[i] = rnd.next(1, 1000);
		has_prime|=prime(a[i]);
	}
	while(!has_prime){
		int x = rnd.next(1, 1000);
		has_prime|=prime(x);
		a[0] = x;
	}
	shuffle(a.begin(), a.end());
	cout<<a[0];
	for(int i = 1;i < n;i++){
		cout<<" "<<a[i];
	}
	cout<<endl;
    return 0;
}
{% endhighlight %}

Open the **Files** tab, and add this file in ***Source Files***.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/14.png)

Go back to the **Tests** tab, and update the ***Script***. There are several forms for each line of the script. You can read about them in the description to the right of the script. Let's add some lines and click ***Save Script***.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/15.png)

### Solution files

We will skip **Stresses** for now and come back to it later. In the **Solution files** tab you can add your solutions, the first added solution is considered the ***Main Correct Solution*** or ***Model Solution***. You can add many solutions and for every solution specify the expected verdict, in my opinion every well prepared problem should have these solutions:

- Main Correct Solution.
- Brute Force Solution - To test your solution against many small tests and be confident that you didn't make any mistake. It doesn't really matter what the complexity of the solution is; this solution must have a ***Time limit Exceeded*** verdict.
- Wrong Answer Solution(s), the problem is `dp`? Write a greedy solution to be sure that you have a test which produces WA, overflow solution, corner cases, etc.
- Time limit Exceeded Solution(s), you should add these solutions for every unwanted complexity. These solution(s) help you to set the time limit correctly.
- Accepted Solution(s), using different approaches, different time complexity and written by different users.
- Accepted Solution(s) written in allowed languages, for example if you are preparing ICPC contest you should add solutions using C, C++, Java and Python.

Let's write two solution files and add them.

### Invocations

Click on ***Want to run solutions?***, select the solutions and tests you want to run. On this page, you can see detailed reports about invocations. Invocation rows in the grid are highlighted if at least one solution got an unexpected verdict on at least one test.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/16.png)

The result of the invocation will be:

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/17.png)

### Stresses

Stress testing is the operation to test your solution against many other tests to check whether your solution passes them all. I have written an article about stress testing; you can find it [here.](https://ali-ibrahim137.github.io/competitive/programming/2020/08/23/Stress-Testing.html)

Using Polygon, you can run stress tests easily. Just click on ***Add Stress*** and fill the form:

- Script pattern - Contains the generator name and the passed arguments.
- Memory limit - Contains the memory limit per test.
- Time limit - Contains the time limit per test.
- Total time limit - The time you want the stress testing to last.
- Solutions - The solutions you want to stress.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/18.png)

When you click ***Run*** then ***View*** you should find something like this:

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/19.png)

The Countertest field will contain the counter test found. This is the test that your solution fails in.

### Issues

You can add issues to the problem. Just specify its type and add text to it. You can also assign this issue to anyone working with you on the problem, add comments to it, and change its status.

### Packages

Packages are ZIP files containing problem files in some special format. Typically, packages are used by Online Judges. Polygon supports a flexible model for packaging. A package contains compiled sources and generated tests. To create the package, you just need to specify its type: standard or Full. You can't create a package if you have changes in your edit session. Commit the changes before package creation. We will come to this later on.

### Manage Access

Each user has one out of three permissions for any problem. User can have "WRITE", "READ" or "NONE" permissions.
- WRITE - If he has "WRITE" permission, he can edit the problem and grant/modify other users' access to this problem.
- READ - If he has "READ" permission, he can start an edit session, but it is impossible to commit it. Also, such a user can't grant/modify access for the problem.
- NONE - The user can't read the problem and has no way to know if it exists.

By default, the problem creator has WRITE permission to the problem.

To grant other users access to this problem, you must click ***Add Users*** and specify the user's Polygon handle and access permission (READ or WRITE). We will give the **Codeforces** user READ access to the problem in order to add it to a mashup contest.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/20.png)

### Edit sessions

Think about an edit session as a working copy placed on the server side. You don't lose your edit session if you close the browser or log out from the system. Users can edit the problem by passing the following steps:

- Create edit session - by clicking ***start*** or ***continue*** in the main **Problems** tab.
- Make changes in the edit session.
- Commit the edit session.

Note that if you don't commit the edit session, no other user will see your changes. Also, the current version of Polygon doesn't take care of conflicts. So if your working copy has a conflict with an already committed revision, you have only one option: destroy this session. For now, we can recommend you to have a short time between commits. Each time you open your session from the **Problem list**, the edit session updates to the latest revision.

To commit the changes, just click on ***Commit Changes*** on the lower-right side. You can write a commit message; this message will be sent by email to every user with access if you want to.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/21.png)

### Add problem to mashup contest

After committing the changes, you can create the package. Go to the **Packages** tab and create a ***Full Package***. Now you can add the problem to a Codeforces mashup contest. This can be done by adding this URL in the ***Add new problem*** option.

![]({{site.url}}/assets/img/Polygon.CodeForces Tutorial/22.png)

### Summary

Through this tutorial, we explained a lot of things. Now we can summarize the whole process in these steps:

1. Create the problem.
2. Grant access to other users working with you, add **Codeforces** user if you want to add the problem to mashup contest.
3. Write statement.
4. Add the checker, and checker tests.
5. Add the validator, and validator tests.
6. Add tests, don't forget to add at least one sample. Upload the generator in the **Files** tab and modify the ***Script***.
7. Add the solutions, as described above you should add many solutions.
8. Run invocations.
9. Depending on the intended solution complexity select the time/memory limits.
10. Run stress tests.
11. Commit changes.
12. Create the package.
13. Congrats, you have completed the problem :D

### Conclusion

These are only the basics of using Polygon. Polygon has a lot of interesting features that I didn't mention here; I will just leave them for you to discover. You can find the used code (Validator, Generator, Checker, and Solution files) [here](https://github.com/Ali-Ibrahim137/Competitive-Programming/tree/master/Articles/Polygon.CodeForces%20Tutorial). If you want READ access for this problem, you can write a comment with your Polygon handle on the Codeforces [blog](https://codeforces.com/blog/entry/83104) or simply message me on Codeforces. I hope you liked this tutorial, please stay tuned for more.
